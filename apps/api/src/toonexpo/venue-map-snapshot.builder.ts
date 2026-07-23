import { Prisma, PublicDisplayMode } from '@prisma/client';
import { mapDisplayModeToWire } from './toonexpo-mappers.util';
import {
  SnapshotAreaWire,
  SnapshotContentWire,
  SnapshotOccupantWire,
} from './types/toonexpo-wire.types';

/** Prisma include used to fetch everything the snapshot builder needs, in one shot. */
export const SNAPSHOT_PLAN_INCLUDE = {
  eventCycle: { select: { id: true, code: true } },
  spaceAreas: {
    orderBy: { id: 'asc' },
    include: {
      cells: { select: { x: true, y: true }, orderBy: [{ x: 'asc' }, { y: 'asc' }] },
      allocations: {
        where: { active: true },
        include: {
          builderDeal: {
            include: {
              organization: { select: { id: true, name: true, toonexpoCompanyId: true } },
            },
          },
          partnerParticipation: {
            include: {
              organization: { select: { id: true, name: true, toonexpoCompanyId: true } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.VenuePlanInclude;

export type SnapshotPlan = Prisma.VenuePlanGetPayload<{ include: typeof SNAPSHOT_PLAN_INCLUDE }>;
type SnapshotArea = SnapshotPlan['spaceAreas'][number];

/**
 * Builds the `content` payload of a VenueMapSnapshotV1, applying privacy rules per area.
 * `background.url` is set to the stable object key (not a presigned URL) so the result is
 * fit for checksum computation; callers must swap in the real presigned URL before sending.
 */
export function buildSnapshotContent(plan: SnapshotPlan): SnapshotContentWire {
  return {
    title: plan.title,
    background: {
      url: plan.imageKey as string,
      width: plan.imageWidth as number,
      height: plan.imageHeight as number,
      pixels_per_meter: plan.pixelsPerMeter as number,
      grid_origin_x: plan.gridOriginX,
      grid_origin_y: plan.gridOriginY,
    },
    areas: plan.spaceAreas.map((area) => buildAreaWire(area)),
  };
}

function buildAreaWire(area: SnapshotArea): SnapshotAreaWire {
  const base: SnapshotAreaWire = {
    code: area.code ?? area.name,
    name: area.name,
    square_meters: area.squareMeters,
    cells: area.cells.map((cell) => ({ x: cell.x, y: cell.y })),
    public_display_mode: mapDisplayModeToWire(area.publicDisplayMode),
  };

  if (area.publicDisplayMode === PublicDisplayMode.HIDDEN) {
    return base;
  }

  if (area.publicDisplayMode === PublicDisplayMode.CUSTOM_LABEL) {
    return area.customPublicLabel ? { ...base, custom_label: area.customPublicLabel } : base;
  }

  const occupant = resolveOccupant(area);
  return occupant ? { ...base, occupant } : base;
}

function resolveOccupant(area: SnapshotArea): SnapshotOccupantWire | undefined {
  const allocation = area.allocations[0];
  const organization =
    allocation?.builderDeal?.organization ?? allocation?.partnerParticipation?.organization;
  if (!organization) {
    return undefined;
  }

  return {
    ...(organization.toonexpoCompanyId
      ? { toonexpo_company_id: organization.toonexpoCompanyId }
      : {}),
    organization_name: organization.name,
  };
}
