'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createOrganization } from '@/lib/api/organizations';
import type { OrganizationListItem, OrganizationType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';

const ORGANIZATION_TYPES: OrganizationType[] = ['BUILDER', 'BANK', 'PARTNER', 'OTHER'];

type OrganizationFormSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (organization: OrganizationListItem) => void;
};

export function OrganizationFormSheet({
  open,
  onClose,
  onCreated,
}: OrganizationFormSheetProps) {
  if (!open) {
    return null;
  }

  return <OrganizationFormSheetInner onClose={onClose} onCreated={onCreated} />;
}

type OrganizationFormSheetInnerProps = {
  onClose: () => void;
  onCreated: (organization: OrganizationListItem) => void;
};

function OrganizationFormSheetInner({ onClose, onCreated }: OrganizationFormSheetInnerProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('BUILDER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const created = await createOrganization({
        name: name.trim(),
        type,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        registrationId: registrationId.trim() || undefined,
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
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" form="org-create-form" variant="primary" disabled={busy}>
            {busy ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      }
    >
      <form id="org-create-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label={t('fields.name')} htmlFor="org-name">
          <TextInput
            id="org-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label={t('fields.type')} htmlFor="org-type">
          <SelectInput
            id="org-type"
            value={type}
            onChange={(event) => setType(event.target.value as OrganizationType)}
          >
            {ORGANIZATION_TYPES.map((item) => (
              <option key={item} value={item}>
                {t(`types.${item}`)}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t('fields.phone')} htmlFor="org-phone">
          <TextInput
            id="org-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field>
        <Field label={t('fields.email')} htmlFor="org-email">
          <TextInput
            id="org-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label={t('fields.website')} htmlFor="org-website">
          <TextInput
            id="org-website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </Field>
        <Field label={t('fields.registrationId')} htmlFor="org-reg">
          <TextInput
            id="org-reg"
            value={registrationId}
            onChange={(event) => setRegistrationId(event.target.value)}
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
