import type { PartnerListItem } from '@/lib/api/types';

export type StaffOption = { id: string; name: string };

export type PartnersLoad =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; partners: PartnerListItem[] };

export function staffFromPartners(partners: PartnerListItem[]): StaffOption[] {
  const map = new Map<string, string>();
  for (const partner of partners) {
    if (partner.assignedStaff) {
      map.set(partner.assignedStaff.id, partner.assignedStaff.name);
    }
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mergePartnerTypes(known: string[], partners: PartnerListItem[]): string[] {
  const next = new Set(known);
  for (const partner of partners) {
    if (partner.partnerType) {
      next.add(partner.partnerType);
    }
  }
  return [...next].sort((a, b) => a.localeCompare(b));
}
