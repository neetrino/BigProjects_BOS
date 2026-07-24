'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createNote, deleteNote, listNotes } from '@/lib/api/notes';
import type { ContentOwnerType, NoteItem } from '@/lib/api/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextArea } from '@/components/ui/field';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { formatDate } from '@/lib/format';

type EntityNotesSectionProps = {
  ownerType: ContentOwnerType;
  ownerId: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; notes: NoteItem[] };

export function EntityNotesSection({ ownerType, ownerId }: EntityNotesSectionProps) {
  const t = useTranslations('content');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NoteItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listNotes(ownerType, ownerId)
      .then((notes) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', notes });
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
  }, [ownerId, ownerType, tCommon]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const created = await createNote({
        ownerType,
        ownerId,
        body: trimmed,
      });
      setBody('');
      setLoadState((prev) =>
        prev.status === 'ready'
          ? { status: 'ready', notes: [created, ...prev.notes] }
          : { status: 'ready', notes: [created] },
      );
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteNote(pendingDelete.id);
      setLoadState((prev) =>
        prev.status === 'ready'
          ? { status: 'ready', notes: prev.notes.filter((item) => item.id !== pendingDelete.id) }
          : prev,
      );
      setPendingDelete(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
      setPendingDelete(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('notes.title')}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <TextArea
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('notes.placeholder')}
          aria-label={t('notes.placeholder')}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={busy || body.trim().length === 0}>
            {busy ? (
              tCommon('saving')
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                {t('notes.add')}
              </>
            )}
          </Button>
        </div>
        {formError ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {formError}
          </p>
        ) : null}
      </form>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && loadState.notes.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('notes.empty')}</p>
      ) : null}
      {loadState.status === 'ready' && loadState.notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {loadState.notes.map((note) => {
            const canDelete = isAdmin || note.author.id === user.id;
            return (
              <li
                key={note.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm text-[var(--color-fg)]">{note.body}</p>
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      {note.author.name} · {formatDate(note.createdAt)}
                    </p>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      aria-label={tCommon('delete')}
                      title={tCommon('delete')}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                      onClick={() => setPendingDelete(note)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <Dialog
        open={pendingDelete !== null}
        title={t('notes.deleteTitle')}
        description={t('notes.deleteDescription')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={deleteBusy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
