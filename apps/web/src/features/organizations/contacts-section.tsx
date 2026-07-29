'use client';

import { FormEvent, useState } from 'react';
import {
  Briefcase,
  Mail,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';
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

function ContactInfoRow({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span className="truncate">{children}</span>
    </p>
  );
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
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('title')}</h3>

      {contacts.length === 0 && !showAdd ? (
        <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3"
          >
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-[var(--color-fg)]">
                    <User className="size-3.5 shrink-0 opacity-70" aria-hidden />
                    <span className="truncate">{contact.name}</span>
                  </p>
                  {contact.position ? (
                    <ContactInfoRow icon={Briefcase}>{contact.position}</ContactInfoRow>
                  ) : null}
                  {contact.phone ? (
                    <ContactInfoRow icon={Phone}>{contact.phone}</ContactInfoRow>
                  ) : null}
                  {contact.email ? (
                    <ContactInfoRow icon={Mail}>{contact.email}</ContactInfoRow>
                  ) : null}
                  {!contact.position && !contact.phone && !contact.email ? (
                    <p className="text-xs text-[var(--color-muted)]">—</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {contact.isPrimary ? (
                    <span className="rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[11.5px] font-semibold text-[var(--color-accent)]">
                      {t('primary')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={t('makePrimary')}
                      title={t('makePrimary')}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] disabled:opacity-50"
                      onClick={() => void handleSetPrimary(contact)}
                    >
                      <Star className="size-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={tCommon('edit')}
                    title={tCommon('edit')}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-white hover:text-[var(--color-fg)]"
                    onClick={() => startEdit(contact)}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={tCommon('delete')}
                    title={tCommon('delete')}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                    onClick={() => setDeleteTarget(contact)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showAdd ? (
        <ContactForm
          draft={draft}
          onChange={setDraft}
          onSubmit={handleAdd}
          busy={busy}
          submitLabel={t('saveNew')}
        />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <Button
        variant="secondary"
        onClick={() => setShowAdd((value) => !value)}
        className="self-end"
      >
        {showAdd ? (
          tCommon('cancel')
        ) : (
          <>
            <Plus className="size-4" aria-hidden />
            {t('add')}
          </>
        )}
      </Button>

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
