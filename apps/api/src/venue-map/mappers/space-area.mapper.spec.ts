import { DealStage, PartnerStage, PublicDisplayMode, type BuilderDeal } from '@prisma/client';
import { mapSpaceAreaToResponse } from './space-area.mapper';
import type { SpaceAreaWithRelations } from './space-area.mapper';

const baseArea: Omit<SpaceAreaWithRelations, 'allocations'> = {
  id: 'area-1',
  code: 'A1',
  name: 'Hall A',
  squareMeters: 40,
  publicDisplayMode: PublicDisplayMode.ORGANIZATION,
  customPublicLabel: null,
  createdAt: new Date('2026-01-01'),
  cells: [{ x: 0, y: 0 }],
};

describe('mapSpaceAreaToResponse', () => {
  it('returns null allocation for a free area', () => {
    const result = mapSpaceAreaToResponse({ ...baseArea, allocations: [] });

    expect(result.allocation).toBeNull();
  });

  it('maps a builder allocation with deal stage and summary fields', () => {
    const result = mapSpaceAreaToResponse({
      ...baseArea,
      allocations: [
        {
          id: 'alloc-1',
          spaceAreaId: baseArea.id,
          builderDealId: 'deal-1',
          partnerParticipationId: null,
          active: true,
          assignedAt: new Date(),
          releasedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          builderDeal: {
            id: 'deal-1',
            eventCycleId: 'cycle-1',
            organizationId: 'org-1',
            primaryContactId: 'contact-1',
            assignedStaffId: null,
            stage: DealStage.NEGOTIATION,
            expectedSqm: 120,
            agreedAmount: 15000 as unknown as BuilderDeal['agreedAmount'],
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: {
              id: 'org-1',
              name: 'Acme Builders',
              type: 'BUILDER',
              registrationId: null,
              phone: null,
              email: null,
              website: null,
              toonexpoCompanyId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            primaryContact: { name: 'Jane Doe' },
          },
          partnerParticipation: null,
        },
      ],
    });

    expect(result.allocation).toEqual({
      id: 'alloc-1',
      kind: 'BUILDER',
      targetId: 'deal-1',
      organizationName: 'Acme Builders',
      deal: {
        id: 'deal-1',
        stage: DealStage.NEGOTIATION,
        amount: 15000,
        expectedSqm: 120,
        primaryContactName: 'Jane Doe',
      },
    });
  });

  it('maps a partner allocation with partner stage', () => {
    const result = mapSpaceAreaToResponse({
      ...baseArea,
      allocations: [
        {
          id: 'alloc-2',
          spaceAreaId: baseArea.id,
          builderDealId: null,
          partnerParticipationId: 'partner-1',
          active: true,
          assignedAt: new Date(),
          releasedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          builderDeal: null,
          partnerParticipation: {
            id: 'partner-1',
            eventCycleId: 'cycle-1',
            organizationId: 'org-2',
            primaryContactId: null,
            assignedStaffId: null,
            stage: PartnerStage.CONFIRMED,
            partnerType: 'BANK',
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: {
              id: 'org-2',
              name: 'City Bank',
              type: 'PARTNER',
              registrationId: null,
              phone: null,
              email: null,
              website: null,
              toonexpoCompanyId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      ],
    });

    expect(result.allocation).toEqual({
      id: 'alloc-2',
      kind: 'PARTNER',
      targetId: 'partner-1',
      organizationName: 'City Bank',
      partner: {
        id: 'partner-1',
        stage: PartnerStage.CONFIRMED,
      },
    });
  });
});
