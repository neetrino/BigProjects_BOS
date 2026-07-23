'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { showToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/format';

type PlanPublishStatus = 'UNPUBLISHED' | 'PUBLISHED';

type VenueMapPublicationSectionProps = {
  planId: string;
  publishStatus: string;
  onPublished: () => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; publications: VenueMapPublication[] };

const PUBLISHED_LIKE: ReadonlySet<VenueMapPublicationStatus> = new Set([
  'PUBLISHED',
  'ALREADY_PUBLISHED',
]);

function publicationStatusTone(status: VenueMapPublicationStatus): StatusTone {
  switch (status) {
    case 'PUBLISHED':
    case 'ALREADY_PUBLISHED':
      return 'won';
    case 'REJECTED':
    case 'FAILED':
      return 'disabled';
    case 'PENDING':
    default:
      return 'draft';
  }
}

function planStatusTone(status: PlanPublishStatus): StatusTone {
  return status === 'PUBLISHED' ? 'won' : 'neutral';
}

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
      return {
        message: errorMessage
          ? t('publication.toastFailedWithError', { error: errorMessage })
          : t('publication.toastFailed'),
        kind: 'error',
      };
    default:
      return { message: t('publication.toastPending'), kind: 'success' };
  }
}

export function VenueMapPublicationSection({
  planId,
  publishStatus,
  onPublished,
}: VenueMapPublicationSectionProps) {
  const t = useTranslations('toonexpo');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      setLoadState({
        status: 'error',
        message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
      });
    }
  }

  const publishedAt = useMemo(() => {
    if (loadState.status !== 'ready') {
      return null;
    }
    const latest = loadState.publications.find(
      (row) => PUBLISHED_LIKE.has(row.status) && row.publishedAt,
    );
    return latest?.publishedAt ?? null;
  }, [loadState]);

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

  const planStatus = (
    publishStatus === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED'
  ) as PlanPublishStatus;

  return (
    <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">{t('publication.title')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={t(`publication.planStatus.${planStatus}`)}
              tone={planStatusTone(planStatus)}
            />
            {publishedAt ? (
              <span className="text-xs text-[var(--color-muted)]">
                {t('publication.publishedAt', { date: formatDate(publishedAt) })}
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="primary" onClick={() => setConfirmOpen(true)}>
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
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {t('publication.historyTitle')}
          </h3>
          {loadState.publications.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">{t('publication.historyEmpty')}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {loadState.publications.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-2 rounded bg-[var(--color-bg)] px-2 py-1.5 text-xs"
                >
                  <span className="font-medium text-[var(--color-fg)]">
                    {t('publication.version', { version: row.snapshotVersion })}
                  </span>
                  <StatusBadge
                    label={t(`publication.status.${row.status}`)}
                    tone={publicationStatusTone(row.status)}
                  />
                  <span className="text-[var(--color-muted)]">{formatDate(row.createdAt)}</span>
                  {row.errorMessage ? (
                    <span className="w-full text-red-700">{row.errorMessage}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

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
