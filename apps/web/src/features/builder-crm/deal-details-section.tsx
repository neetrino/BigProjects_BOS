'use client';

import { useTranslations } from 'next-intl';
import type { OrganizationContact } from '@/lib/api/types';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/field';

type StaffOption = {
  id: string;
  name: string;
};

export type DealDetailsDraft = {
  primaryContactId: string;
  assignedStaffId: string;
  expectedSqm: string;
  agreedAmount: string;
  description: string;
};

type DealDetailsSectionProps = {
  organizationName: string;
  draft: DealDetailsDraft;
  contacts: OrganizationContact[];
  staffOptions: StaffOption[];
  onChange: (updater: (prev: DealDetailsDraft) => DealDetailsDraft) => void;
};

export function DealDetailsSection({
  organizationName,
  draft,
  contacts,
  staffOptions,
  onChange,
}: DealDetailsSectionProps) {
  const t = useTranslations('builderSales');

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('sheet.details')}</h3>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{t('fields.organization')}</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline">
          {organizationName}
        </p>
      </div>
      <Field label={t('fields.contact')} htmlFor="deal-contact">
        <SelectInput
          id="deal-contact"
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
      <Field label={t('fields.staff')} htmlFor="deal-staff">
        <SelectInput
          id="deal-staff"
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
      <Field label={t('fields.expectedSqm')} htmlFor="deal-sqm">
        <TextInput
          id="deal-sqm"
          type="number"
          min={0}
          value={draft.expectedSqm}
          onChange={(event) => onChange((prev) => ({ ...prev, expectedSqm: event.target.value }))}
        />
      </Field>
      <Field label={t('fields.agreedAmount')} htmlFor="deal-amount">
        <TextInput
          id="deal-amount"
          inputMode="decimal"
          value={draft.agreedAmount}
          onChange={(event) => onChange((prev) => ({ ...prev, agreedAmount: event.target.value }))}
        />
      </Field>
      <Field label={t('fields.description')} htmlFor="deal-description">
        <TextArea
          id="deal-description"
          rows={3}
          value={draft.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
        />
      </Field>
    </section>
  );
}
