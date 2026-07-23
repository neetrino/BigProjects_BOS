'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createVenuePlan } from '@/lib/api/venue-map';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { showToast } from '@/components/ui/toast';

type CreatePlanFormProps = {
  cycleId: string;
  onCreated: () => void;
};

export function CreatePlanForm({ cycleId, onCreated }: CreatePlanFormProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      showToast(t('createPlan.titleRequired'), 'error');
      return;
    }
    setBusy(true);
    try {
      await createVenuePlan({ eventCycleId: cycleId, title: trimmed });
      setTitle('');
      onCreated();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-sm flex-col gap-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--color-fg)]">{t('createPlan.title')}</h2>
      <p className="text-sm text-[var(--color-muted)]">{t('createPlan.description')}</p>
      <Field label={t('createPlan.name')} htmlFor="plan-title">
        <TextInput
          id="plan-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Button variant="primary" disabled={busy} onClick={() => void handleCreate()}>
        {busy ? tCommon('saving') : t('createPlan.confirm')}
      </Button>
    </div>
  );
}
