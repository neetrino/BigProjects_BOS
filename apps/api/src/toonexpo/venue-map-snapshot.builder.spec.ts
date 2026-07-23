import { PublicDisplayMode } from '@prisma/client';
import { buildSnapshotContent, SnapshotPlan } from './venue-map-snapshot.builder';

const basePlan = {
  id: 'plan-1',
  eventCycleId: 'cycle-1',
  title: 'Main Hall',
  imageKey: 'venue-plans/plan-1/bg.png',
  imageWidth: 2000,
  imageHeight: 1000,
  pixelsPerMeter: 20,
  gridOriginX: 0,
  gridOriginY: 0,
  publishStatus: 'UNPUBLISHED',
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  eventCycle: { id: 'cycle-1', code: 'EXPO-2026' },
};

function buildArea(overrides: Record<string, unknown>) {
  return {
    id: 'area-1',
    venuePlanId: 'plan-1',
    code: 'A1',
    name: 'Hall A',
    squareMeters: 25,
    publicDisplayMode: PublicDisplayMode.ORGANIZATION,
    customPublicLabel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    cells: [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ],
    allocations: [],
    ...overrides,
  };
}

const allocatedByBuilder = [
  {
    builderDeal: {
      organization: { id: 'org-1', name: 'Acme Builders', toonexpoCompanyId: 'toon-co-1' },
    },
    partnerParticipation: null,
  },
];

describe('buildSnapshotContent', () => {
  it('includes occupant when mode=organization and the area is allocated', () => {
    const plan = {
      ...basePlan,
      spaceAreas: [buildArea({ allocations: allocatedByBuilder })],
    } as SnapshotPlan;

    const content = buildSnapshotContent(plan);

    expect(content.areas[0].occupant).toEqual({
      toonexpo_company_id: 'toon-co-1',
      organization_name: 'Acme Builders',
    });
    expect(content.areas[0].custom_label).toBeUndefined();
  });

  it('omits occupant when mode=organization but no active allocation exists', () => {
    const plan = { ...basePlan, spaceAreas: [buildArea({ allocations: [] })] } as SnapshotPlan;

    const content = buildSnapshotContent(plan);

    expect(content.areas[0].occupant).toBeUndefined();
  });

  it('omits occupant and label for hidden areas, even when allocated', () => {
    const plan = {
      ...basePlan,
      spaceAreas: [
        buildArea({ publicDisplayMode: PublicDisplayMode.HIDDEN, allocations: allocatedByBuilder }),
      ],
    } as SnapshotPlan;

    const content = buildSnapshotContent(plan);

    expect(content.areas[0].occupant).toBeUndefined();
    expect(content.areas[0].custom_label).toBeUndefined();
    expect(content.areas[0].code).toBe('A1');
    expect(content.areas[0].cells).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('includes only the custom label for custom_label areas, never occupant data', () => {
    const plan = {
      ...basePlan,
      spaceAreas: [
        buildArea({
          publicDisplayMode: PublicDisplayMode.CUSTOM_LABEL,
          customPublicLabel: 'Sponsor Lounge',
          allocations: allocatedByBuilder,
        }),
      ],
    } as SnapshotPlan;

    const content = buildSnapshotContent(plan);

    expect(content.areas[0].custom_label).toBe('Sponsor Lounge');
    expect(content.areas[0].occupant).toBeUndefined();
  });

  it('falls back to the area name as code when no code is set', () => {
    const plan = { ...basePlan, spaceAreas: [buildArea({ code: null })] } as SnapshotPlan;

    const content = buildSnapshotContent(plan);

    expect(content.areas[0].code).toBe('Hall A');
  });
});
