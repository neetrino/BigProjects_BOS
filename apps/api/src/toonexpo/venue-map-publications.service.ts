import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PlanPublishStatus, VenueMapPublication, VenueMapPublicationStatus } from '@prisma/client';
import { StorageService } from '../attachments/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { VenueMapPublicationResponseDto } from './dto/venue-map-publication-response.dto';
import { computeContentChecksum } from './snapshot-checksum.util';
import { ToonExpoClientService } from './toonexpo-client.service';
import { mapPublishStatusFromWire } from './toonexpo-mappers.util';
import { toPublicationResponse } from './toonexpo-response.mapper';
import { VenueMapPublishResponseWire, SnapshotContentWire } from './types/toonexpo-wire.types';
import {
  buildSnapshotContent,
  SNAPSHOT_PLAN_INCLUDE,
  SnapshotPlan,
} from './venue-map-snapshot.builder';

const PLAN_NOT_FOUND_MESSAGE = 'Venue plan not found.';
const PLAN_NOT_CALIBRATED_MESSAGE =
  'Venue plan must have a background image and calibration (pixels per meter) before publishing.';
const INITIAL_SNAPSHOT_VERSION = 1;
const BACKGROUND_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
const PUBLISHED_LIKE_STATUSES: ReadonlySet<VenueMapPublicationStatus> = new Set([
  VenueMapPublicationStatus.PUBLISHED,
  VenueMapPublicationStatus.ALREADY_PUBLISHED,
]);

/**
 * Publishes a `VenueMapSnapshotV1` for a venue plan. Re-publishing byte-identical content
 * reuses the previous `snapshotVersion` and `checksum` (idempotent replay -> ToonExpo reports
 * `already_published`); any content change bumps to the next version.
 */
@Injectable()
export class VenueMapPublicationsService {
  private readonly logger = new Logger(VenueMapPublicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: ToonExpoClientService,
    private readonly storageService: StorageService,
  ) {}

  async publish(planId: string): Promise<VenueMapPublicationResponseDto> {
    const plan = await this.getCalibratedPlanOrThrow(planId);
    const content = buildSnapshotContent(plan);
    const checksum = computeContentChecksum(content);
    const row = await this.prepareAttemptRow(planId, checksum);

    try {
      const response = await this.sendPublishRequest(row, plan, content, checksum);
      return await this.persistResult(row.id, planId, response);
    } catch (error: unknown) {
      return await this.persistFailure(row.id, error);
    }
  }

  async list(planId: string): Promise<VenueMapPublicationResponseDto[]> {
    const rows = await this.prisma.venueMapPublication.findMany({
      where: { venuePlanId: planId },
      orderBy: { snapshotVersion: 'desc' },
    });
    return rows.map((row) => toPublicationResponse(row));
  }

  private async sendPublishRequest(
    row: VenueMapPublication,
    plan: SnapshotPlan,
    content: SnapshotContentWire,
    checksum: string,
  ): Promise<VenueMapPublishResponseWire> {
    const backgroundUrl = await this.storageService.createPresignedGetUrl(
      plan.imageKey as string,
      BACKGROUND_URL_EXPIRY_SECONDS,
    );

    return this.client.publishVenueMap({
      request_id: row.id,
      schema_version: 'venue-map.v1',
      bos_venue_plan_id: plan.id,
      bos_event_cycle_id: plan.eventCycle.id,
      bos_event_cycle_code: plan.eventCycle.code,
      snapshot_version: row.snapshotVersion,
      checksum,
      published_at: new Date().toISOString(),
      content: { ...content, background: { ...content.background, url: backgroundUrl } },
    });
  }

  /**
   * Creates a fresh attempt row (and therefore a fresh wire `request_id`) for every publish
   * call. Unlike provisioning, ToonExpo's venue-map idempotency contract is version+checksum
   * based, not request_id based, so replaying the *same* request_id would just echo back the
   * previous response instead of letting ToonExpo evaluate "already_published" / "rejected".
   * The old row at the target version (if any) is deleted first so the `@@unique` constraint
   * on `(venuePlanId, snapshotVersion)` is never violated and no duplicate rows accumulate.
   */
  private async prepareAttemptRow(planId: string, checksum: string): Promise<VenueMapPublication> {
    const last = await this.prisma.venueMapPublication.findFirst({
      where: { venuePlanId: planId },
      orderBy: { snapshotVersion: 'desc' },
    });

    const unchanged = last !== null && last.checksum === checksum;
    const snapshotVersion = unchanged
      ? last.snapshotVersion
      : (last?.snapshotVersion ?? INITIAL_SNAPSHOT_VERSION - 1) + 1;

    return this.prisma.$transaction(async (tx) => {
      await tx.venueMapPublication.deleteMany({ where: { venuePlanId: planId, snapshotVersion } });
      return tx.venueMapPublication.create({
        data: {
          venuePlanId: planId,
          snapshotVersion,
          checksum,
          status: VenueMapPublicationStatus.PENDING,
        },
      });
    });
  }

  private async persistResult(
    rowId: string,
    planId: string,
    response: VenueMapPublishResponseWire,
  ): Promise<VenueMapPublicationResponseDto> {
    const status = mapPublishStatusFromWire(response.status);
    const errorMessage = PUBLISHED_LIKE_STATUSES.has(status)
      ? null
      : (response.validation_errors?.join('; ') ??
        `Unexpected ToonExpo status: "${response.status}".`);
    const publishedAt = PUBLISHED_LIKE_STATUSES.has(status) ? new Date() : null;

    const row = await this.prisma.venueMapPublication.update({
      where: { id: rowId },
      data: {
        status,
        toonexpoSnapshotId: response.toonexpo_snapshot_id,
        errorMessage,
        publishedAt,
      },
    });

    if (PUBLISHED_LIKE_STATUSES.has(status)) {
      await this.prisma.venuePlan.update({
        where: { id: planId },
        data: { publishStatus: PlanPublishStatus.PUBLISHED, publishedAt: row.publishedAt },
      });
    }

    return toPublicationResponse(row);
  }

  private async persistFailure(
    id: string,
    error: unknown,
  ): Promise<VenueMapPublicationResponseDto> {
    const message = error instanceof Error ? error.message : 'Unknown ToonExpo integration error.';
    this.logger.error(`ToonExpo venue map publication ${id} failed: ${message}`);

    const row = await this.prisma.venueMapPublication.update({
      where: { id },
      data: { status: VenueMapPublicationStatus.FAILED, errorMessage: message },
    });

    return toPublicationResponse(row);
  }

  private async getCalibratedPlanOrThrow(planId: string): Promise<SnapshotPlan> {
    const plan = await this.prisma.venuePlan.findUnique({
      where: { id: planId },
      include: SNAPSHOT_PLAN_INCLUDE,
    });
    if (!plan) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
    if (!plan.imageKey || !plan.pixelsPerMeter) {
      throw new BadRequestException(PLAN_NOT_CALIBRATED_MESSAGE);
    }
    return plan;
  }
}
