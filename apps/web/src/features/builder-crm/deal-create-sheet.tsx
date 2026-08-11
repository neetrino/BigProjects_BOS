'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createDeal } from '@/lib/api/deals';
import { getOrganization } from '@/lib/api/organizations';
import type { DealListItem, OrganizationContact, OrganizationListItem } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { OrganizationFormSheet } from '@/features/organizations/organization-form-sheet';
import { OrganizationSearchSelect } from '@/features/organizations/organization-search-select';

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
  return (
    <DealCreateSheetInner
      key={eventCycleId}
      open={open}
      eventCycleId={eventCycleId}
      staffOptions={staffOptions}
      onClose={onClose}
      onCreated={onCreated}
    />
  );
}

type DealCreateSheetInnerProps = {
  open: boolean;
  eventCycleId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onCreated: (deal: DealListItem) => void;
};

function DealCreateSheetInner({
  open,
  eventCycleId,
  staffOptions,
  onClose,
  onCreated,
}: DealCreateSheetInnerProps) {
  const t = useTranslations('builderSales');
  const tCommon = useTranslations('common');

  const [organization, setOrganization] = useState<OrganizationListItem | null>(null);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createOrgName, setCreateOrgName] = useState('');
  const [contacts, setContacts] = useState<OrganizationContact[]>([]);
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [expectedSqm, setExpectedSqm] = useState('');
  const [agreedAmount, setAgreedAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!organization) {
      setContacts([]);
      setPrimaryContactId('');
      return;
    }

    let cancelled = false;
    void getOrganization(organization.id)
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
  }, [organization]);

  function handleOrganizationChange(next: OrganizationListItem | null) {
    setOrganization(next);
    setContacts([]);
    setPrimaryContactId('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) {
      setError(t('createForm.organizationRequired'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const sqmValue = expectedSqm.trim() ? Number(expectedSqm) : undefined;
      const created = await createDeal({
        eventCycleId,
        organizationId: organization.id,
        primaryContactId: primaryContactId || undefined,
        assignedStaffId: assignedStaffId || undefined,
        expectedSqm: sqmValue != null && !Number.isNaN(sqmValue) ? sqmValue : undefined,
        agreedAmount: agreedAmount.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Sheet
        open={open}
        title={t('createTitle')}
        onClose={onClose}
        widthClassName="w-full sm:w-[min(100%,30rem)]"
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
          <OrganizationSearchSelect
            id="create-org-search"
            label={t('fields.organization')}
            value={organization}
            onChange={handleOrganizationChange}
            onCreateClick={(suggestedName) => {
              setCreateOrgName(suggestedName);
              setCreateOrgOpen(true);
            }}
          />
          <Field label={t('fields.contact')} htmlFor="create-contact">
            <SelectInput
              id="create-contact"
              value={primaryContactId}
              onChange={(event) => setPrimaryContactId(event.target.value)}
              disabled={!organization}
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
              inputMode="numeric"
              pattern="[0-9]*"
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
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}
        </form>
      </Sheet>

      <OrganizationFormSheet
        open={createOrgOpen}
        initialName={createOrgName}
        onClose={() => setCreateOrgOpen(false)}
        onCreated={(created) => {
          handleOrganizationChange(created);
          setCreateOrgOpen(false);
        }}
      />
    </>
  );
}
