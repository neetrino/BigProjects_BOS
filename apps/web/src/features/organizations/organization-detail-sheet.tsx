'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { deleteOrganization, getOrganization, updateOrganization } from '@/lib/api/organizations';
import type { OrganizationContact, OrganizationDetail, OrganizationType } from '@/lib/api/types';
import { ContactsSection } from '@/features/organizations/contacts-section';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, SelectInput, TextInput } from '@/components/ui/field';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { Sheet } from '@/components/ui/sheet';
import { showToast } from '@/components/ui/toast';

const ORGANIZATION_TYPES: OrganizationType[] = ['BUILDER', 'BANK', 'PARTNER', 'OTHER'];

type OrganizationDetailSheetProps = {
  organizationId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
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
  onDeleted,
}: OrganizationDetailSheetProps) {
  const [activeId, setActiveId] = useState<string | null>(organizationId);

  if (open && organizationId && organizationId !== activeId) {
    setActiveId(organizationId);
  }

  if (!activeId) {
    return null;
  }

  return (
    <OrganizationDetailSheetInner
      key={activeId}
      open={open && organizationId === activeId}
      organizationId={activeId}
      onClose={onClose}
      onUpdated={onUpdated}
      onDeleted={onDeleted}
    />
  );
}

type OrganizationDetailSheetInnerProps = {
  open: boolean;
  organizationId: string;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

function OrganizationDetailSheetInner({
  open,
  organizationId,
  onClose,
  onUpdated,
  onDeleted,
}: OrganizationDetailSheetInnerProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<DetailLoadState>({ status: 'loading' });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

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

  async function handleDelete() {
    if (loadState.status !== 'ready') {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteOrganization(loadState.detail.id);
      setDeleteOpen(false);
      onClose();
      onDeleted();
      showToast(t('deleted'), 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const sheetTitle = loadState.status === 'ready' ? loadState.detail.name : t('detailTitle');
  const sheetSubtitle =
    loadState.status === 'ready' ? t(`types.${loadState.detail.type}`) : undefined;

  return (
    <>
      <Sheet
        open={open}
        title={sheetTitle}
        subtitle={sheetSubtitle}
        onClose={onClose}
        widthClassName="w-full sm:w-[min(100%,30rem)]"
        headerActions={
          loadState.status === 'ready' ? (
            <button
              type="button"
              aria-label={tCommon('delete')}
              title={tCommon('delete')}
              disabled={busy || deleteBusy}
              onClick={() => setDeleteOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          ) : undefined
        }
        footer={
          isDirty ? (
            <div className="flex flex-col gap-2">
              {saveError ? <p className="text-sm text-[var(--color-danger)]">{saveError}</p> : null}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelDraft}
                  disabled={busy}
                  className="flex-1"
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => void handleSave()}
                  disabled={busy}
                  className="flex-1"
                >
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
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">
                {t('detailsSection')}
              </h3>
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
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, website: event.target.value }))
                  }
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
      <Dialog
        open={deleteOpen}
        title={t('deleteTitle')}
        description={t('deleteDescription', {
          name: loadState.status === 'ready' ? loadState.detail.name : '',
        })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={deleteBusy}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
