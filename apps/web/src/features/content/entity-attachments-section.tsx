'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import {
  confirmAttachment,
  deleteAttachment,
  getAttachmentDownloadUrl,
  listAttachments,
  presignAttachment,
  putPresignedFile,
} from '@/lib/api/attachments';
import type { AttachmentItem, ContentOwnerType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { showToast } from '@/components/ui/toast';
import { MAX_ATTACHMENT_BYTES } from '@/lib/constants';
import { formatDate, formatFileSize } from '@/lib/format';

type EntityAttachmentsSectionProps = {
  ownerType: ContentOwnerType;
  ownerId: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: AttachmentItem[] };

export function EntityAttachmentsSection({ ownerType, ownerId }: EntityAttachmentsSectionProps) {
  const t = useTranslations('content');
  const tCommon = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [uploadBusy, setUploadBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AttachmentItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listAttachments(ownerType, ownerId)
      .then((items) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', items });
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

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      showToast(t('attachments.tooLarge'), 'error');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setUploadBusy(true);
    try {
      const contentType = file.type || 'application/octet-stream';
      const presign = await presignAttachment({
        ownerType,
        ownerId,
        filename: file.name,
        contentType,
        size: file.size,
      });
      await putPresignedFile(presign.uploadUrl, file);
      const created = await confirmAttachment({
        ownerType,
        ownerId,
        objectKey: presign.objectKey,
        originalFilename: file.name,
        contentType,
        size: file.size,
      });
      setLoadState((prev) =>
        prev.status === 'ready'
          ? { status: 'ready', items: [created, ...prev.items] }
          : { status: 'ready', items: [created] },
      );
      showToast(t('attachments.uploadSuccess'), 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('attachments.uploadFailed'), 'error');
    } finally {
      setUploadBusy(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  async function handleDownload(item: AttachmentItem) {
    try {
      const { downloadUrl } = await getAttachmentDownloadUrl(item.id);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    }
  }

  async function handleDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteAttachment(pendingDelete.id);
      setLoadState((prev) =>
        prev.status === 'ready'
          ? {
              status: 'ready',
              items: prev.items.filter((item) => item.id !== pendingDelete.id),
            }
          : prev,
      );
      setPendingDelete(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
      setPendingDelete(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('attachments.title')}</h3>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            onChange={(event) => void handleFileChange(event.target.files)}
            disabled={uploadBusy}
          />
          <Button
            variant="secondary"
            disabled={uploadBusy}
            onClick={() => inputRef.current?.click()}
          >
            {uploadBusy ? t('attachments.uploading') : t('attachments.upload')}
          </Button>
        </div>
      </div>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && loadState.items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('attachments.empty')}</p>
      ) : null}
      {loadState.status === 'ready' && loadState.items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {loadState.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] pb-2 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-fg)]">
                  {item.originalFilename}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {formatFileSize(item.size)} · {item.uploader.name} · {formatDate(item.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  className="px-1.5 text-xs"
                  onClick={() => void handleDownload(item)}
                >
                  {t('attachments.download')}
                </Button>
                <Button
                  variant="ghost"
                  className="px-1.5 text-xs"
                  onClick={() => setPendingDelete(item)}
                >
                  {tCommon('delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog
        open={pendingDelete !== null}
        title={t('attachments.deleteTitle')}
        description={t('attachments.deleteDescription', {
          name: pendingDelete?.originalFilename ?? '',
        })}
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
