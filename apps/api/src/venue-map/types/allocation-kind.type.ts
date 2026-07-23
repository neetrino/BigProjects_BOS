/**
 * There is no `AllocationKind` column in the database: a `SpaceAllocation` row's kind is
 * derived from which of `builderDealId` / `partnerParticipationId` is set (the DB CHECK
 * constraint guarantees exactly one is non-null).
 */
export type AllocationKind = 'BUILDER' | 'PARTNER';

export const ALLOCATION_KIND_VALUES: readonly AllocationKind[] = ['BUILDER', 'PARTNER'];
