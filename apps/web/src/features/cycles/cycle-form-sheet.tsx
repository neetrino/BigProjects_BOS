'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createCycle, updateCycle } from '@/lib/api/cycles';
import type { EventCycle } from '@/lib/api/types';
import { dateInputToIso, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Field, TextInput, DateInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';

type CycleFormSheetProps = {
  open: boolean;
  cycle: EventCycle | null;
  onClose: () => void;
  onSaved: (cycle: EventCycle) => void;
};

export function CycleFormSheet({ open, cycle, onClose, onSaved }: CycleFormSheetProps) {
  return (
    <CycleFormSheetInner
      key={cycle?.id ?? 'create'}
      open={open}
      cycle={cycle}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

type CycleFormSheetInnerProps = {
  open: boolean;
  cycle: EventCycle | null;
  onClose: () => void;
  onSaved: (cycle: EventCycle) => void;
};

function CycleFormSheetInner({ open, cycle, onClose, onSaved }: CycleFormSheetInnerProps) {
  const t = useTranslations('cycles');
  const tCommon = useTranslations('common');
  const isEdit = cycle !== null;
  const [name, setName] = useState(cycle?.name ?? '');
  const [code, setCode] = useState(cycle?.code ?? '');
  const [startsAt, setStartsAt] = useState(formatDate(cycle?.startsAt));
  const [endsAt, setEndsAt] = useState(formatDate(cycle?.endsAt));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <Sheet
      open={open}
      title={isEdit ? t('editTitle') : t('createTitle')}
      onClose={onClose}
      widthClassName="w-full sm:w-[min(100%,24rem)]"
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
  );
}
