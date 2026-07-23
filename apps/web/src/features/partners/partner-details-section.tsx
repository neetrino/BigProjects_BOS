'use client';

import { useTranslations } from 'next-intl';
import type { OrganizationContact } from '@/lib/api/types';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/field';

type StaffOption = {
  id: string;
  name: string;
};

export type PartnerDetailsDraft = {
  primaryContactId: string;
  assignedStaffId: string;
  partnerType: string;
  description: string;
};

type PartnerDetailsSectionProps = {
  organizationName: string;
  draft: PartnerDetailsDraft;
  contacts: OrganizationContact[];
  staffOptions: StaffOption[];
  onChange: (updater: (prev: PartnerDetailsDraft) => PartnerDetailsDraft) => void;
};

export function PartnerDetailsSection({
  organizationName,
  draft,
  contacts,
  staffOptions,
  onChange,
}: PartnerDetailsSectionProps) {
  const t = useTranslations('partners');

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('sheet.details')}</h3>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{t('fields.organization')}</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline">
          {organizationName}
        </p>
      </div>
      <Field label={t('fields.contact')} htmlFor="partner-contact">
        <SelectInput
          id="partner-contact"
          value={draft.primaryContactId}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, primaryContactId: event.target.value }))
          }
        >
          <option value="">{t('createForm.noContact')}</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label={t('fields.staff')} htmlFor="partner-staff">
        <SelectInput
          id="partner-staff"
          value={draft.assignedStaffId}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, assignedStaffId: event.target.value }))
          }
        >
          <option value="">{t('createForm.unassigned')}</option>
          {staffOptions.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label={t('fields.partnerType')} htmlFor="partner-type">
        <TextInput
          id="partner-type"
          value={draft.partnerType}
          onChange={(event) => onChange((prev) => ({ ...prev, partnerType: event.target.value }))}
        />
      </Field>
      <Field label={t('fields.description')} htmlFor="partner-description">
        <TextArea
          id="partner-description"
          rows={3}
          value={draft.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
        />
      </Field>
    </section>
  );
}
