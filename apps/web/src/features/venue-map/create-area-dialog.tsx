'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createSpaceArea } from '@/lib/api/venue-map';
import { Dialog } from '@/components/ui/dialog';
import { Field, TextInput } from '@/components/ui/field';
import { showToast } from '@/components/ui/toast';
import type { GridCell } from './domain/grid-transform';

type CreateAreaDialogProps = {
  open: boolean;
  planId: string;
  cells: readonly GridCell[];
  onCreated: () => void;
  onCancel: () => void;
};

export function CreateAreaDialog({
  open,
  planId,
  cells,
  onCreated,
  onCancel,
}: CreateAreaDialogProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const squareMeters = cells.length;

  async function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast(t('createArea.nameRequired'), 'error');
      return;
    }
    setBusy(true);
    try {
      await createSpaceArea(planId, {
        name: trimmed,
        code: code.trim() || undefined,
        cells: cells.map((cell) => ({ x: cell.column, y: cell.row })),
      });
      setName('');
      setCode('');
      onCreated();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={t('createArea.title')}
      description={t('createArea.description', { sqm: squareMeters })}
      confirmLabel={busy ? tCommon('saving') : t('createArea.confirm')}
      cancelLabel={tCommon('cancel')}
      busy={busy}
      onConfirm={() => void handleConfirm()}
      onCancel={onCancel}
    >
      <div className="mt-3 flex flex-col gap-3">
        <Field label={t('createArea.name')} htmlFor="create-area-name">
          <TextInput
            id="create-area-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </Field>
        <Field label={t('createArea.code')} htmlFor="create-area-code">
          <TextInput
            id="create-area-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>
      </div>
    </Dialog>
  );
}
