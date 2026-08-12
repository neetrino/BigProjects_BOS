'use client';

import { useRef, useState } from 'react';
import { ImageUp, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { uploadVenuePlanImage } from '@/lib/api/venue-map';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';
import {
  ACCEPTED_PLAN_IMAGE_TYPES,
  MAX_PLAN_IMAGE_BYTES,
  TOOLBAR_CONTROL_CLASS,
} from './constants';

type UploadPlanImageProps = {
  planId: string;
  onUploaded: () => void;
  compact?: boolean;
};

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });
}

export function UploadPlanImage({ planId, onUploaded, compact = false }: UploadPlanImageProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    if (
      !ACCEPTED_PLAN_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_PLAN_IMAGE_TYPES)[number])
    ) {
      showToast(t('upload.invalidType'), 'error');
      return;
    }
    if (file.size > MAX_PLAN_IMAGE_BYTES) {
      showToast(t('upload.tooLarge'), 'error');
      return;
    }
    setBusy(true);
    try {
      const { width, height } = await readImageDimensions(file);
      await uploadVenuePlanImage(planId, file, width, height);
      showToast(t('upload.success'), 'success');
      onUploaded();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('upload.failed'), 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div
      className={
        compact
          ? 'flex items-center gap-2'
          : 'flex flex-col items-start gap-3 rounded-[15px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6'
      }
    >
      {!compact ? (
        <>
          <p className="text-sm font-medium text-[var(--color-fg)]">{t('upload.title')}</p>
          <p className="text-sm text-[var(--color-muted)]">{t('upload.hint')}</p>
        </>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PLAN_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <Button
        variant="primary"
        disabled={busy}
        className={compact ? TOOLBAR_CONTROL_CLASS : undefined}
        onClick={() => inputRef.current?.click()}
      >
        {compact ? (
          <ImageUp className="size-4" aria-hidden />
        ) : (
          <Upload className="size-4" aria-hidden />
        )}
        {busy ? t('upload.uploading') : compact ? t('upload.replace') : t('upload.choose')}
      </Button>
      {busy ? <p className="text-xs text-[var(--color-muted)]">{tCommon('loading')}</p> : null}
    </div>
  );
}
