'use client';

import { FormEvent, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createCycle, deleteCycle, updateCycle } from '@/lib/api/cycles';
import type { EventCycle } from '@/lib/api/types';
import { dateInputToIso, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, TextInput, DateInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { showToast } from '@/components/ui/toast';

type CycleFormSheetProps = {
  open: boolean;
  cycle: EventCycle | null;
  onClose: () => void;
  onSaved: (cycle: EventCycle) => void;
  onDeleted: (cycleId: string) => void;
};

export function CycleFormSheet({ open, cycle, onClose, onSaved, onDeleted }: CycleFormSheetProps) {
  return (
    <CycleFormSheetInner
      key={cycle?.id ?? 'create'}
      open={open}
      cycle={cycle}
      onClose={onClose}
      onSaved={onSaved}
      onDeleted={onDeleted}
    />
  );
}

type CycleFormSheetInnerProps = {
  open: boolean;
  cycle: EventCycle | null;
  onClose: () => void;
  onSaved: (cycle: EventCycle) => void;
  onDeleted: (cycleId: string) => void;
};

function CycleFormSheetInner({
  open,
  cycle,
  onClose,
  onSaved,
  onDeleted,
}: CycleFormSheetInnerProps) {
  const t = useTranslations('cycles');
  const tCommon = useTranslations('common');
  const isEdit = cycle !== null;
  const [name, setName] = useState(cycle?.name ?? '');
  const [code, setCode] = useState(cycle?.code ?? '');
  const [startsAt, setStartsAt] = useState(formatDate(cycle?.startsAt));
  const [endsAt, setEndsAt] = useState(formatDate(cycle?.endsAt));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName) {
      setError(t('errors.nameRequired'));
      setBusy(false);
      return;
    }
    if (!trimmedCode) {
      setError(t('errors.codeRequired'));
      setBusy(false);
      return;
    }
    if (startsAt && endsAt && endsAt < startsAt) {
      setError(t('errors.endsBeforeStarts'));
      setBusy(false);
      return;
    }

    const payload = {
      name: trimmedName,
      code: trimmedCode,
      startsAt: dateInputToIso(startsAt),
      endsAt: dateInputToIso(endsAt),
    };

    try {
      const saved = isEdit ? await updateCycle(cycle.id, payload) : await createCycle(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!cycle) {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteCycle(cycle.id);
      setDeleteOpen(false);
      onClose();
      onDeleted(cycle.id);
      showToast(t('confirm.deleted'), 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <Sheet
        open={open}
        title={isEdit ? t('editTitle') : t('createTitle')}
        onClose={onClose}
        widthClassName="w-full sm:w-[min(100%,24rem)]"
        headerActions={
          isEdit ? (
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
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" form="cycle-form" variant="primary" disabled={busy}>
              {busy ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
        }
      >
        <form id="cycle-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label={t('fields.name')} htmlFor="cycle-name">
            <TextInput
              id="cycle-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label={t('fields.code')} htmlFor="cycle-code">
            <TextInput
              id="cycle-code"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </Field>
          <Field label={t('fields.startsAt')} htmlFor="cycle-starts">
            <DateInput
              id="cycle-starts"
              value={startsAt}
              onChange={setStartsAt}
              aria-label={t('fields.startsAt')}
            />
          </Field>
          <Field label={t('fields.endsAt')} htmlFor="cycle-ends">
            <DateInput
              id="cycle-ends"
              value={endsAt}
              onChange={setEndsAt}
              aria-label={t('fields.endsAt')}
            />
          </Field>
          {error ? (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}
        </form>
      </Sheet>
      <Dialog
        open={deleteOpen}
        title={t('confirm.deleteTitle')}
        description={t('confirm.deleteDescription', { name: cycle?.name ?? '' })}
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
