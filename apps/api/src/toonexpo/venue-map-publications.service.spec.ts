import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanPublishStatus, PublicDisplayMode, VenueMapPublicationStatus } from '@prisma/client';
import { StorageService } from '../attachments/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { computeContentChecksum } from './snapshot-checksum.util';
import { ToonExpoClientService } from './toonexpo-client.service';
import { VenueMapPublicationsService } from './venue-map-publications.service';
import { buildSnapshotContent, SnapshotPlan } from './venue-map-snapshot.builder';

const planId = 'plan-1';
const backgroundUrl = 'https://presigned.example/venue-plans/plan-1/bg.png';

const calibratedPlan = {
  id: planId,
  eventCycleId: 'cycle-1',
  title: 'Main Hall',
  imageKey: 'venue-plans/plan-1/bg.png',
  imageWidth: 2000,
  imageHeight: 1000,
  pixelsPerMeter: 20,
  gridOriginX: 0,
  gridOriginY: 0,
  eventCycle: { id: 'cycle-1', code: 'EXPO-2026' },
  spaceAreas: [
    {
      id: 'area-1',
      code: 'A1',
      name: 'Hall A',
      squareMeters: 25,
      publicDisplayMode: PublicDisplayMode.HIDDEN,
      customPublicLabel: null,
      cells: [{ x: 0, y: 0 }],
      allocations: [],
    },
  ],
};

function publicationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pub-1',
    venuePlanId: planId,
    snapshotVersion: 1,
    checksum: 'checksum-v1',
    status: VenueMapPublicationStatus.PENDING,
    toonexpoSnapshotId: null,
    errorMessage: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('VenueMapPublicationsService', () => {
  let service: VenueMapPublicationsService;
  let prisma: {
    venuePlan: { findUnique: jest.Mock; update: jest.Mock };
    venueMapPublication: {
      findFirst: jest.Mock;
      deleteMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let client: { publishVenueMap: jest.Mock };
  let storage: { createPresignedGetUrl: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      venuePlan: { findUnique: jest.fn().mockResolvedValue(calibratedPlan), update: jest.fn() },
      venueMapPublication: {
        findFirst: jest.fn().mockResolvedValue(null),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockImplementation(async ({ data }) => publicationRow(data)),
        update: jest.fn().mockImplementation(async ({ data }) => ({ ...publicationRow(), ...data })),
        findMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
    };
    client = { publishVenueMap: jest.fn() };
    storage = { createPresignedGetUrl: jest.fn().mockResolvedValue(backgroundUrl) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueMapPublicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ToonExpoClientService, useValue: client },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(VenueMapPublicationsService);
  });

  it('rejects publishing an uncalibrated plan', async () => {
    prisma.venuePlan.findUnique.mockResolvedValue({ ...calibratedPlan, pixelsPerMeter: null });

    await expect(service.publish(planId)).rejects.toThrow(BadRequestException);
    expect(client.publishVenueMap).not.toHaveBeenCalled();
  });

  it('uses snapshot version 1 for the first publication of a plan', async () => {
    client.publishVenueMap.mockResolvedValue({
      request_id: 'pub-1',
      bos_venue_plan_id: planId,
      accepted_snapshot_version: 1,
      toonexpo_snapshot_id: 'toon-snap-1',
      status: 'published',
      activated_at: new Date().toISOString(),
    });

    await service.publish(planId);

    expect(prisma.venueMapPublication.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ snapshotVersion: 1 }) }),
    );
  });

  it('reuses the previous version and checksum when content is unchanged, with a fresh request id', async () => {
    const currentChecksum = computeContentChecksum(
      buildSnapshotContent(calibratedPlan as unknown as SnapshotPlan),
    );
    prisma.venueMapPublication.findFirst.mockResolvedValue(
      publicationRow({ id: 'pub-old', snapshotVersion: 1, checksum: currentChecksum }),
    );
    prisma.venueMapPublication.create.mockImplementation(async ({ data }) =>
      publicationRow({ id: 'pub-new', ...data }),
    );
    client.publishVenueMap.mockResolvedValue({
      request_id: 'pub-new',
      bos_venue_plan_id: planId,
      accepted_snapshot_version: 1,
      toonexpo_snapshot_id: 'toon-snap-1',
      status: 'already_published',
      activated_at: new Date().toISOString(),
    });

    const result = await service.publish(planId);

    expect(prisma.venueMapPublication.deleteMany).toHaveBeenCalledWith({
      where: { venuePlanId: planId, snapshotVersion: 1 },
    });
    expect(prisma.venueMapPublication.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ snapshotVersion: 1 }) }),
    );
    expect(client.publishVenueMap).toHaveBeenCalledWith(
      expect.objectContaining({ request_id: 'pub-new', snapshot_version: 1 }),
    );
    expect(result.status).toBe(VenueMapPublicationStatus.ALREADY_PUBLISHED);
  });

  it('increments the version when content changes', async () => {
    prisma.venueMapPublication.findFirst.mockResolvedValue(
      publicationRow({ snapshotVersion: 2, checksum: 'a-different-checksum' }),
    );
    client.publishVenueMap.mockResolvedValue({
      request_id: 'pub-1',
      bos_venue_plan_id: planId,
      accepted_snapshot_version: 3,
      toonexpo_snapshot_id: 'toon-snap-3',
      status: 'published',
      activated_at: new Date().toISOString(),
    });

    await service.publish(planId);

    expect(prisma.venueMapPublication.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ snapshotVersion: 3 }) }),
    );
  });

  it('sets VenuePlan.publishStatus to PUBLISHED on a published response', async () => {
    client.publishVenueMap.mockResolvedValue({
      request_id: 'pub-1',
      bos_venue_plan_id: planId,
      accepted_snapshot_version: 1,
      toonexpo_snapshot_id: 'toon-snap-1',
      status: 'published',
      activated_at: new Date().toISOString(),
    });

    await service.publish(planId);

    expect(prisma.venuePlan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: planId },
        data: expect.objectContaining({ publishStatus: PlanPublishStatus.PUBLISHED }),
      }),
    );
  });

  it('records REJECTED and does not touch VenuePlan.publishStatus on a version conflict', async () => {
    client.publishVenueMap.mockResolvedValue({
      request_id: 'pub-1',
      bos_venue_plan_id: planId,
      accepted_snapshot_version: 1,
      toonexpo_snapshot_id: null,
      status: 'rejected',
      validation_errors: ['Snapshot version/checksum conflicts with a previously accepted snapshot.'],
    });

    const result = await service.publish(planId);

    expect(result.status).toBe(VenueMapPublicationStatus.REJECTED);
    expect(prisma.venuePlan.update).not.toHaveBeenCalled();
  });

  it('marks the row FAILED (without throwing) when the client rejects', async () => {
    client.publishVenueMap.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await service.publish(planId);

    expect(result.status).toBe(VenueMapPublicationStatus.FAILED);
    expect(result.errorMessage).toContain('ECONNREFUSED');
  });
});
