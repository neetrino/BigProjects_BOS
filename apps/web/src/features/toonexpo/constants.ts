import type { ToonExpoModule } from '@/lib/api/toonexpo';
import type { OrganizationType } from '@/lib/api/types';

export const TOONEXPO_MODULES: readonly ToonExpoModule[] = [
  'builder_portal',
  'constructor_crm',
  'readiness',
  'partner_profile',
  'bank_offers',
  'analytics',
] as const;

export const BUILDER_DEFAULT_MODULES: readonly ToonExpoModule[] = [
  'builder_portal',
  'constructor_crm',
  'readiness',
] as const;

export const PARTNER_DEFAULT_MODULES: readonly ToonExpoModule[] = ['partner_profile'] as const;

export const BUILDER_MODULES: readonly ToonExpoModule[] = [
  'builder_portal',
  'constructor_crm',
  'readiness',
  'analytics',
] as const;

export const PARTNER_MODULES: readonly ToonExpoModule[] = [
  'partner_profile',
  'bank_offers',
  'analytics',
] as const;

export function defaultModulesForCompanyType(
  companyType: Extract<OrganizationType, 'BUILDER' | 'PARTNER'>,
): ToonExpoModule[] {
  return companyType === 'BUILDER' ? [...BUILDER_DEFAULT_MODULES] : [...PARTNER_DEFAULT_MODULES];
}

export function availableModulesForCompanyType(
  companyType: Extract<OrganizationType, 'BUILDER' | 'PARTNER'>,
): readonly ToonExpoModule[] {
  return companyType === 'BUILDER' ? BUILDER_MODULES : PARTNER_MODULES;
}
