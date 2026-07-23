'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createDeal } from '@/lib/api/deals';
import { getOrganization, listOrganizations } from '@/lib/api/organizations';
import type { DealListItem, OrganizationContact, OrganizationListItem } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { SEARCH_DEBOUNCE_MS } from '@/features/builder-crm/constants';

type StaffOption = {
  id: string;
  name: string;
};

type DealCreateSheetProps = {
  open: boolean;
  eventCycleId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onCreated: (deal: DealListItem) => void;
};

export function DealCreateSheet({
  open,
  eventCycleId,
  staffOptions,
  onClose,
  onCreated,
}: DealCreateSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <DealCreateSheetInner
      key={eventCycleId}
      eventCycleId={eventCycleId}
      staffOptions={staffOptions}
      onClose={onClose}
      onCreated={onCreated}
    />
  );
}

type DealCreateSheetInnerProps = {
  eventCycleId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onCreated: (deal: DealListItem) => void;
};

function DealCreateSheetInner({
  eventCycleId,
  staffOptions,
  onClose,
  onCreated,
}: DealCreateSheetInnerProps) {
  const t = useTranslations('builderSales');
  const tCommon = useTranslations('common');

  const [orgSearch, setOrgSearch] = useState('');
  const [orgQuery, setOrgQuery] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [contacts, setContacts] = useState<OrganizationContact[]>([]);
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [expectedSqm, setExpectedSqm] = useState('');
  const [agreedAmount, setAgreedAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOrgQuery(orgSearch.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [orgSearch]);

  useEffect(() => {
    let cancelled = false;
    void listOrganizations({ search: orgQuery || undefined })
      .then((items) => {
        if (!cancelled) {
          setOrganizations(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrganizations([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orgQuery]);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let cancelled = false;
    void getOrganization(organizationId)
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setContacts(detail.contacts);
        const primary = detail.contacts.find((item) => item.isPrimary);
        setPrimaryContactId(primary?.id ?? '');
      })
      .catch(() => {
        if (!cancelled) {
          setContacts([]);
          setPrimaryContactId('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId) {
      setError(t('createForm.organizationRequired'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const sqmValue = expectedSqm.trim() ? Number(expectedSqm) : undefined;
      const created = await createDeal({
        eventCycleId,
        organizationId,
        primaryContactId: primaryContactId || undefined,
        assignedStaffId: assignedStaffId || undefined,
        expectedSqm: sqmValue != null && !Number.isNaN(sqmValue) ? sqmValue : undefined,
        agreedAmount: agreedAmount.trim() || undefined,
        description: description.trim() || undefined,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open
      title={t('createTitle')}
      onClose={onClose}
      widthClassName="w-full max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" form="deal-create-form" variant="primary" disabled={busy}>
            {busy ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      }
    >
      <form id="deal-create-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label={t('fields.organization')} htmlFor="create-org-search">
          <TextInput
            id="create-org-search"
            value={orgSearch}
            onChange={(event) => setOrgSearch(event.target.value)}
            placeholder={t('createForm.orgSearchPlaceholder')}
          />
        </Field>
        <Field label={t('fields.organizationSelect')} htmlFor="create-org">
          <SelectInput
            id="create-org"
            required
            value={organizationId}
            onChange={(event) => {
              setOrganizationId(event.target.value);
              setContacts([]);
              setPrimaryContactId('');
            }}
          >
            <option value="">{t('createForm.pickOrganization')}</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t('fields.contact')} htmlFor="create-contact">
          <SelectInput
            id="create-contact"
            value={primaryContactId}
            onChange={(event) => setPrimaryContactId(event.target.value)}
            disabled={!organizationId}
          >
            <option value="">{t('createForm.noContact')}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t('fields.staff')} htmlFor="create-staff">
          <SelectInput
            id="create-staff"
            value={assignedStaffId}
            onChange={(event) => setAssignedStaffId(event.target.value)}
          >
            <option value="">{t('createForm.unassigned')}</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t('fields.expectedSqm')} htmlFor="create-sqm">
          <TextInput
            id="create-sqm"
            type="number"
            min={0}
            value={expectedSqm}
            onChange={(event) => setExpectedSqm(event.target.value)}
          />
        </Field>
        <Field label={t('fields.agreedAmount')} htmlFor="create-amount">
          <TextInput
            id="create-amount"
            inputMode="decimal"
            value={agreedAmount}
            onChange={(event) => setAgreedAmount(event.target.value)}
          />
        </Field>
        <Field label={t('fields.description')} htmlFor="create-description">
          <TextArea
            id="create-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>
    </Sheet>
  );
}
