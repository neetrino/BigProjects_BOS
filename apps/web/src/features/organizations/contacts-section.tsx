'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createContact, deleteContact, updateContact } from '@/lib/api/organizations';
import type { OrganizationContact } from '@/lib/api/types';
import {
  ContactForm,
  EMPTY_CONTACT_DRAFT,
  type ContactDraft,
} from '@/features/organizations/contact-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

type ContactsSectionProps = {
  organizationId: string;
  contacts: OrganizationContact[];
  onChange: (contacts: OrganizationContact[]) => void;
};

function applyPrimary(contacts: OrganizationContact[], primaryId: string): OrganizationContact[] {
  return contacts.map((item) => ({
    ...item,
    isPrimary: item.id === primaryId,
  }));
}

export function ContactsSection({ organizationId, contacts, onChange }: ContactsSectionProps) {
  const t = useTranslations('organizations.contacts');
  const tCommon = useTranslations('common');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<ContactDraft>(EMPTY_CONTACT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ContactDraft>(EMPTY_CONTACT_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationContact | null>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createContact(organizationId, {
        name: draft.name.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        position: draft.position.trim() || undefined,
        isPrimary: draft.isPrimary,
      });
      const next = created.isPrimary
        ? applyPrimary([...contacts, created], created.id)
        : [...contacts, created];
      onChange(next);
      setDraft(EMPTY_CONTACT_DRAFT);
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(contact: OrganizationContact) {
    setEditingId(contact.id);
    setEditDraft({
      name: contact.name,
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      position: contact.position ?? '',
      isPrimary: contact.isPrimary,
    });
    setError(null);
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateContact(editingId, {
        name: editDraft.name.trim(),
        phone: editDraft.phone.trim() || undefined,
        email: editDraft.email.trim() || undefined,
        position: editDraft.position.trim() || undefined,
        isPrimary: editDraft.isPrimary,
      });
      const mapped = contacts.map((item) => (item.id === updated.id ? updated : item));
      onChange(updated.isPrimary ? applyPrimary(mapped, updated.id) : mapped);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPrimary(contact: OrganizationContact) {
    if (contact.isPrimary) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateContact(contact.id, { isPrimary: true });
      onChange(applyPrimary(contacts, updated.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteContact(deleteTarget.id);
      onChange(contacts.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('title')}</h3>
        <Button variant="secondary" onClick={() => setShowAdd((value) => !value)}>
          {showAdd ? tCommon('cancel') : t('add')}
        </Button>
      </div>

      {showAdd ? (
        <ContactForm
          draft={draft}
          onChange={setDraft}
          onSubmit={handleAdd}
          busy={busy}
          submitLabel={t('saveNew')}
        />
      ) : null}

      {contacts.length === 0 && !showAdd ? (
        <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <li key={contact.id} className="rounded bg-[var(--color-bg)] px-3 py-2">
            {editingId === contact.id ? (
              <ContactForm
                draft={editDraft}
                onChange={setEditDraft}
                onSubmit={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                busy={busy}
                submitLabel={tCommon('save')}
              />
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-fg)]">
                    {contact.name}
                    {contact.isPrimary ? (
                      <span className="ml-2 text-xs text-[var(--color-accent)]">
                        {t('primary')}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-[var(--color-muted)]">
                    {[contact.position, contact.phone, contact.email]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!contact.isPrimary ? (
                    <Button
                      variant="ghost"
                      className="px-2 text-xs"
                      disabled={busy}
                      onClick={() => void handleSetPrimary(contact)}
                    >
                      {t('makePrimary')}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="px-2 text-xs"
                    onClick={() => startEdit(contact)}
                  >
                    {tCommon('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2 text-xs"
                    onClick={() => setDeleteTarget(contact)}
                  >
                    {tCommon('delete')}
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Dialog
        open={deleteTarget !== null}
        title={t('deleteTitle')}
        description={t('deleteDescription', { name: deleteTarget?.name ?? '' })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
