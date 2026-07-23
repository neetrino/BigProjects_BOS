'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import {
  listProvisioningRequests,
  retryProvisioningRequest,
  type ProvisioningRequest,
  type ToonExpoRequestStatus,
} from '@/lib/api/toonexpo';
import type { OrganizationType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { showToast } from '@/components/ui/toast';
import { ProvisioningRequestDialog } from '@/features/toonexpo/provisioning-request-dialog';

type ToonExpoAccountSectionProps = {
  organizationId: string;
  eventCycleId: string;
  companyType: Extract<OrganizationType, 'BUILDER' | 'PARTNER'>;
  toonexpoCompanyId: string | null;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; latestRequest: ProvisioningRequest | null };

function requestStatusTone(status: ToonExpoRequestStatus): StatusTone {
  switch (status) {
    case 'SUCCESS':
      return 'won';
    case 'LINKED_EXISTING':
      return 'neutral';
    case 'FAILED':
      return 'disabled';
    case 'PENDING':
    default:
      return 'draft';
  }
}

export function ToonExpoAccountSection({
  organizationId,
  eventCycleId,
  companyType,
  toonexpoCompanyId,
}: ToonExpoAccountSectionProps) {
  const t = useTranslations('toonexpo');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retryBusy, setRetryBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listProvisioningRequests({ organizationId, cycleId: eventCycleId })
      .then((rows) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', latestRequest: rows[0] ?? null });
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
  }, [organizationId, eventCycleId, tCommon]);

  function handleCreated(request: ProvisioningRequest) {
    setLoadState({ status: 'ready', latestRequest: request });
  }

  async function handleRetry(requestId: string) {
    setRetryBusy(true);
    try {
      const updated = await retryProvisioningRequest(requestId);
      setLoadState({ status: 'ready', latestRequest: updated });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setRetryBusy(false);
    }
  }

  const linkedCompanyId =
    toonexpoCompanyId ??
    (loadState.status === 'ready' &&
    loadState.latestRequest &&
    (loadState.latestRequest.status === 'SUCCESS' ||
      loadState.latestRequest.status === 'LINKED_EXISTING')
      ? loadState.latestRequest.toonexpoCompanyId
      : null);

  const isLinked = Boolean(toonexpoCompanyId) ||
    (loadState.status === 'ready' &&
      loadState.latestRequest != null &&
      (loadState.latestRequest.status === 'SUCCESS' ||
        loadState.latestRequest.status === 'LINKED_EXISTING'));

  return (
    <section className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {t('account.title')}
      </h3>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}

      {loadState.status === 'ready' ? (
        <div className="flex flex-col gap-2">
          {isLinked && linkedCompanyId ? (
            <>
              <StatusBadge label={t('account.linked')} tone="won" />
              <p className="text-sm text-[var(--color-fg)]">
                {t('account.companyId', { id: linkedCompanyId })}
              </p>
            </>
          ) : loadState.latestRequest?.status === 'FAILED' ? (
            <>
              <StatusBadge
                label={t('account.requestStatus.FAILED')}
                tone={requestStatusTone('FAILED')}
              />
              {loadState.latestRequest.errorMessage ? (
                <p className="text-sm text-red-700">{loadState.latestRequest.errorMessage}</p>
              ) : null}
              <Button
                variant="secondary"
                disabled={retryBusy}
                onClick={() => void handleRetry(loadState.latestRequest!.id)}
              >
                {retryBusy ? tCommon('saving') : t('account.retry')}
              </Button>
            </>
          ) : loadState.latestRequest?.status === 'PENDING' ? (
            <>
              <StatusBadge
                label={t('account.requestStatus.PENDING')}
                tone={requestStatusTone('PENDING')}
              />
              <p className="text-sm text-[var(--color-muted)]">{t('account.pendingHint')}</p>
            </>
          ) : loadState.latestRequest &&
            (loadState.latestRequest.status === 'SUCCESS' ||
              loadState.latestRequest.status === 'LINKED_EXISTING') ? (
            <>
              <StatusBadge
                label={t(`account.requestStatus.${loadState.latestRequest.status}`)}
                tone={requestStatusTone(loadState.latestRequest.status)}
              />
              {loadState.latestRequest.toonexpoCompanyId ? (
                <p className="text-sm text-[var(--color-fg)]">
                  {t('account.companyId', { id: loadState.latestRequest.toonexpoCompanyId })}
                </p>
              ) : null}
            </>
          ) : (
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              {t('account.requestButton')}
            </Button>
          )}
        </div>
      ) : null}

      <ProvisioningRequestDialog
        open={dialogOpen}
        organizationId={organizationId}
        eventCycleId={eventCycleId}
        companyType={companyType}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </section>
  );
}
