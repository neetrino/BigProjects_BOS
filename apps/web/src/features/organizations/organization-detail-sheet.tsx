'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { getOrganization, updateOrganization } from '@/lib/api/organizations';
import type { OrganizationContact, OrganizationDetail, OrganizationType } from '@/lib/api/types';
import { ContactsSection } from '@/features/organizations/contacts-section';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextInput } from '@/components/ui/field';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { Sheet } from '@/components/ui/sheet';

const ORGANIZATION_TYPES: OrganizationType[] = ['BUILDER', 'BANK', 'PARTNER', 'OTHER'];

type OrganizationDetailSheetProps = {
  organizationId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

type DetailDraft = {
  name: string;
  type: OrganizationType;
  phone: string;
  email: string;
  website: string;
  registrationId: string;
};

type DetailLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; detail: OrganizationDetail; draft: DetailDraft };

function toDraft(organization: OrganizationDetail): DetailDraft {
  return {
    name: organization.name,
    type: organization.type,
    phone: organization.phone ?? '',
    email: organization.email ?? '',
    website: organization.website ?? '',
    registrationId: organization.registrationId ?? '',
  };
}

export function OrganizationDetailSheet({
  organizationId,
  open,
  onClose,
  onUpdated,
}: OrganizationDetailSheetProps) {
  if (!open || !organizationId) {
    return null;
  }

  return (
    <OrganizationDetailSheetInner
      key={organizationId}
      organizationId={organizationId}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}

type OrganizationDetailSheetInnerProps = {
  organizationId: string;
  onClose: () => void;
  onUpdated: () => void;
};

function OrganizationDetailSheetInner({
  organizationId,
  onClose,
  onUpdated,
}: OrganizationDetailSheetInnerProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<DetailLoadState>({ status: 'loading' });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getOrganization(organizationId)
      .then((detail) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', detail, draft: toDraft(detail) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, tCommon]);

  const isDirty = useMemo(() => {
    if (loadState.status !== 'ready') {
      return false;
    }
    const baseline = toDraft(loadState.detail);
    const { draft } = loadState;
    return (
      draft.name !== baseline.name ||
      draft.type !== baseline.type ||
      draft.phone !== baseline.phone ||
      draft.email !== baseline.email ||
      draft.website !== baseline.website ||
      draft.registrationId !== baseline.registrationId
    );
  }, [loadState]);

  function setDraft(updater: (prev: DetailDraft) => DetailDraft) {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return { ...prev, draft: updater(prev.draft) };
    });
  }

  function handleContactsChange(contacts: OrganizationContact[]) {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return {
        ...prev,
        detail: { ...prev.detail, contacts, contactCount: contacts.length },
      };
    });
    onUpdated();
  }

  function handleCancelDraft() {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return { ...prev, draft: toDraft(prev.detail) };
    });
    setSaveError(null);
  }

  async function handleSave() {
    if (loadState.status !== 'ready') {
      return;
    }
    const { detail, draft } = loadState;
    setBusy(true);
    setSaveError(null);
    try {
      const updated = await updateOrganization(detail.id, {
        name: draft.name.trim(),
        type: draft.type,
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        website: draft.website.trim() || undefined,
        registrationId: draft.registrationId.trim() || undefined,
      });
      const next: OrganizationDetail = {
        ...detail,
        ...updated,
        contacts: detail.contacts,
      };
      setLoadState({ status: 'ready', detail: next, draft: toDraft(next) });
      onUpdated();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open
      title={t('detailTitle')}
      onClose={onClose}
      widthClassName="w-full max-w-lg"
      footer={
        isDirty ? (
          <div className="flex items-center justify-between gap-2">
            {saveError ? <p className="text-sm text-[var(--color-danger)]">{saveError}</p> : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCancelDraft} disabled={busy}>
                {tCommon('cancel')}
              </Button>
              <Button variant="primary" onClick={() => void handleSave()} disabled={busy}>
                {busy ? tCommon('saving') : tCommon('save')}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('detailsSection')}</h3>
            <Field label={t('fields.name')} htmlFor="detail-name">
              <TextInput
                id="detail-name"
                value={loadState.draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field label={t('fields.type')} htmlFor="detail-type">
              <SelectInput
                id="detail-type"
                value={loadState.draft.type}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    type: event.target.value as OrganizationType,
                  }))
                }
              >
                {ORGANIZATION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {t(`types.${item}`)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label={t('fields.phone')} htmlFor="detail-phone">
              <TextInput
                id="detail-phone"
                value={loadState.draft.phone}
                onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </Field>
            <Field label={t('fields.email')} htmlFor="detail-email">
              <TextInput
                id="detail-email"
                type="email"
                value={loadState.draft.email}
                onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Field>
            <Field label={t('fields.website')} htmlFor="detail-website">
              <TextInput
                id="detail-website"
                value={loadState.draft.website}
                onChange={(event) => setDraft((prev) => ({ ...prev, website: event.target.value }))}
              />
            </Field>
            <Field label={t('fields.registrationId')} htmlFor="detail-reg">
              <TextInput
                id="detail-reg"
                value={loadState.draft.registrationId}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, registrationId: event.target.value }))
                }
              />
            </Field>
          </section>

          <ContactsSection
            organizationId={loadState.detail.id}
            contacts={loadState.detail.contacts}
            onChange={handleContactsChange}
          />
        </div>
      ) : null}
    </Sheet>
  );
}
