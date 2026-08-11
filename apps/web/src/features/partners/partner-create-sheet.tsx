'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createPartner } from '@/lib/api/partners';
import { getOrganization } from '@/lib/api/organizations';
import type { OrganizationContact, OrganizationListItem, PartnerListItem } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { OrganizationFormSheet } from '@/features/organizations/organization-form-sheet';
import { OrganizationSearchSelect } from '@/features/organizations/organization-search-select';

type StaffOption = {
  id: string;
  name: string;
};

type PartnerCreateSheetProps = {
  open: boolean;
  eventCycleId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onCreated: (partner: PartnerListItem) => void;
};

export function PartnerCreateSheet({
  open,
  eventCycleId,
  staffOptions,
  onClose,
  onCreated,
}: PartnerCreateSheetProps) {
  return (
    <PartnerCreateSheetInner
      key={eventCycleId}
      open={open}
      eventCycleId={eventCycleId}
      staffOptions={staffOptions}
      onClose={onClose}
      onCreated={onCreated}
    />
  );
}

type PartnerCreateSheetInnerProps = {
  open: boolean;
  eventCycleId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onCreated: (partner: PartnerListItem) => void;
};

function PartnerCreateSheetInner({
  open,
  eventCycleId,
  staffOptions,
  onClose,
  onCreated,
}: PartnerCreateSheetInnerProps) {
  const t = useTranslations('partners');
  const tCommon = useTranslations('common');

  const [organization, setOrganization] = useState<OrganizationListItem | null>(null);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createOrgName, setCreateOrgName] = useState('');
  const [contacts, setContacts] = useState<OrganizationContact[]>([]);
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!organization) {
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
      const created = await createPartner({
        eventCycleId,
        organizationId: organization.id,
        primaryContactId: primaryContactId || undefined,
        assignedStaffId: assignedStaffId || undefined,
        partnerType: partnerType.trim() || undefined,
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
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" form="partner-create-form" variant="primary" disabled={busy}>
              {busy ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
        }
      >
        <form id="partner-create-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <OrganizationSearchSelect
            id="partner-create-org-search"
            label={t('fields.organization')}
            value={organization}
            onChange={handleOrganizationChange}
            onCreateClick={(suggestedName) => {
              setCreateOrgName(suggestedName);
              setCreateOrgOpen(true);
            }}
          />
          <Field label={t('fields.contact')} htmlFor="partner-create-contact">
            <SelectInput
              id="partner-create-contact"
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
          <Field label={t('fields.partnerType')} htmlFor="partner-create-type">
            <TextInput
              id="partner-create-type"
              value={partnerType}
              onChange={(event) => setPartnerType(event.target.value)}
              placeholder={t('createForm.partnerTypePlaceholder')}
            />
          </Field>
          <Field label={t('fields.staff')} htmlFor="partner-create-staff">
            <SelectInput
              id="partner-create-staff"
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
          <Field label={t('fields.description')} htmlFor="partner-create-description">
            <TextArea
              id="partner-create-description"
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
