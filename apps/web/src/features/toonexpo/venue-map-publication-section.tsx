'use client';

import { useEffect, useState } from 'react';
import { CloudUpload, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import {
  listVenueMapPublications,
  publishVenueMap,
  type VenueMapPublication,
  type VenueMapPublicationStatus,
} from '@/lib/api/toonexpo';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { showToast } from '@/components/ui/toast';
import {
  PublicationHistoryRow,
  PublicationHistorySheet,
} from '@/features/toonexpo/publication-history-sheet';

type VenueMapPublicationSectionProps = {
  planId: string;
  onPublished: () => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; publications: VenueMapPublication[] };

const HISTORY_PREVIEW_LIMIT = 3;

function toastForPublication(
  status: VenueMapPublicationStatus,
  errorMessage: string | null,
  t: ReturnType<typeof useTranslations<'toonexpo'>>,
): { message: string; kind: 'success' | 'error' } {
  switch (status) {
    case 'PUBLISHED':
      return { message: t('publication.toastPublished'), kind: 'success' };
    case 'ALREADY_PUBLISHED':
      return { message: t('publication.toastAlreadyPublished'), kind: 'success' };
    case 'REJECTED':
      return {
        message: errorMessage
          ? t('publication.toastRejectedWithError', { error: errorMessage })
          : t('publication.toastRejected'),
        kind: 'error',
      };
    case 'FAILED':
      return { message: t('publication.toastFailed'), kind: 'error' };
    default:
      return { message: t('publication.toastPending'), kind: 'success' };
  }
}

export function VenueMapPublicationSection({
  planId,
  onPublished,
}: VenueMapPublicationSectionProps) {
  const t = useTranslations('toonexpo');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listVenueMapPublications(planId)
      .then((publications) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', publications });
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
  }, [planId, tCommon]);

  async function reloadPublications() {
    try {
      const publications = await listVenueMapPublications(planId);
      setLoadState({ status: 'ready', publications });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : tCommon('unexpectedError');
      setLoadState((prev) => (prev.status === 'ready' ? prev : { status: 'error', message }));
      showToast(message, 'error');
    }
  }

  async function handlePublish() {
    setPublishBusy(true);
    try {
      const result = await publishVenueMap(planId);
      const toast = toastForPublication(result.status, result.errorMessage, t);
      showToast(toast.message, toast.kind);
      setConfirmOpen(false);
      await reloadPublications();
      onPublished();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setPublishBusy(false);
    }
  }

  const publications = loadState.status === 'ready' ? loadState.publications : [];
  const previewPublications = publications.slice(0, HISTORY_PREVIEW_LIMIT);
  const hasHistory = publications.length > 0;

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <History className="size-5" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-[var(--color-fg)]">
            {t('publication.historyTitle')}
          </h2>
        </div>
        <Button variant="primary" onClick={() => setConfirmOpen(true)}>
          <CloudUpload className="size-4" aria-hidden />
          {t('publication.publishButton')}
        </Button>
      </div>

      {loadState.status === 'loading' ? (
        <div className="mt-3">
          <LoadingState message={tCommon('loading')} />
        </div>
      ) : null}
      {loadState.status === 'error' ? (
        <div className="mt-3">
          <ErrorState message={loadState.message} />
        </div>
      ) : null}

      {loadState.status === 'ready' ? (
        <div className="mt-3 flex flex-col gap-2">
          {!hasHistory ? (
            <p className="text-sm text-[var(--color-muted)]">{t('publication.historyEmpty')}</p>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="text-xs font-semibold text-[var(--color-accent)] outline-none hover:underline"
                >
                  {t('publication.historyViewAll', { count: publications.length })}
                </button>
              </div>
              <ul className="grid grid-cols-3 gap-1.5">
                {previewPublications.map((row) => (
                  <PublicationHistoryRow key={row.id} row={row} compact />
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}

      <PublicationHistorySheet
        open={historyOpen}
        publications={publications}
        onClose={() => setHistoryOpen(false)}
      />

      <Dialog
        open={confirmOpen}
        title={t('publication.confirmTitle')}
        description={t('publication.confirmDescription')}
        confirmLabel={publishBusy ? tCommon('saving') : t('publication.publishButton')}
        cancelLabel={tCommon('cancel')}
        busy={publishBusy}
        onConfirm={() => void handlePublish()}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
