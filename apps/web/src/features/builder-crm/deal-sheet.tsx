'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { getDeal, updateDeal } from '@/lib/api/deals';
import { getOrganization } from '@/lib/api/organizations';
import type { DealListItem, DealStage, OrganizationContact } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { Sheet } from '@/components/ui/sheet';
import { showToast } from '@/components/ui/toast';
import { DealAttachmentsSection } from '@/features/builder-crm/deal-attachments-section';
import {
  DealDetailsSection,
  type DealDetailsDraft,
} from '@/features/builder-crm/deal-details-section';
import { DealNotesSection } from '@/features/builder-crm/deal-notes-section';
import { DealStageSection } from '@/features/builder-crm/deal-stage-section';

type StaffOption = {
  id: string;
  name: string;
};

type DealSheetProps = {
  dealId: string | null;
  open: boolean;
  staffOptions: StaffOption[];
  onClose: () => void;
  onUpdated: (deal: DealListItem) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      deal: DealListItem;
      draft: DealDetailsDraft;
      contacts: OrganizationContact[];
    };

function toDraft(deal: DealListItem): DealDetailsDraft {
  return {
    primaryContactId: deal.primaryContact?.id ?? '',
    assignedStaffId: deal.assignedStaff?.id ?? '',
    expectedSqm: deal.expectedSqm != null ? String(deal.expectedSqm) : '',
    agreedAmount: deal.agreedAmount != null ? String(deal.agreedAmount) : '',
    description: deal.description ?? '',
  };
}

export function DealSheet({ dealId, open, staffOptions, onClose, onUpdated }: DealSheetProps) {
  if (!open || !dealId) {
    return null;
  }

  return (
    <DealSheetInner
      key={dealId}
      dealId={dealId}
      staffOptions={staffOptions}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}

type DealSheetInnerProps = {
  dealId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onUpdated: (deal: DealListItem) => void;
};

function DealSheetInner({ dealId, staffOptions, onClose, onUpdated }: DealSheetInnerProps) {
  const t = useTranslations('builderSales');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stageBusy, setStageBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getDeal(dealId)
      .then(async (deal) => {
        const detail = await getOrganization(deal.organizationId);
        if (!cancelled) {
          setLoadState({
            status: 'ready',
            deal,
            draft: toDraft(deal),
            contacts: detail.contacts,
          });
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
  }, [dealId, tCommon]);

  const isDirty = useMemo(() => {
    if (loadState.status !== 'ready') {
      return false;
    }
    const baseline = toDraft(loadState.deal);
    const { draft } = loadState;
    return (
      draft.primaryContactId !== baseline.primaryContactId ||
      draft.assignedStaffId !== baseline.assignedStaffId ||
      draft.expectedSqm !== baseline.expectedSqm ||
      draft.agreedAmount !== baseline.agreedAmount ||
      draft.description !== baseline.description
    );
  }, [loadState]);

  function setDraft(updater: (prev: DealDetailsDraft) => DealDetailsDraft) {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return { ...prev, draft: updater(prev.draft) };
    });
  }

  function applyDeal(deal: DealListItem) {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return { ...prev, deal, draft: toDraft(deal) };
    });
    onUpdated(deal);
  }

  function handleCancelDraft() {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      return { ...prev, draft: toDraft(prev.deal) };
    });
    setSaveError(null);
  }

  async function handleSave() {
    if (loadState.status !== 'ready') {
      return;
    }
    const { draft } = loadState;
    const sqmRaw = draft.expectedSqm.trim();
    const sqmValue = sqmRaw ? Number(sqmRaw) : null;

    setBusy(true);
    setSaveError(null);
    try {
      const updated = await updateDeal(dealId, {
        primaryContactId: draft.primaryContactId || null,
        assignedStaffId: draft.assignedStaffId || null,
        expectedSqm: sqmValue != null && !Number.isNaN(sqmValue) ? sqmValue : null,
        agreedAmount: draft.agreedAmount.trim() || null,
        description: draft.description.trim() || null,
      });
      applyDeal(updated);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleStageChange(stage: DealStage) {
    setStageBusy(true);
    try {
      const updated = await updateDeal(dealId, { stage });
      applyDeal(updated);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setStageBusy(false);
    }
  }

  return (
    <Sheet
      open
      title={t('detailTitle')}
      onClose={onClose}
      widthClassName="w-full max-w-md"
      footer={
        isDirty ? (
          <div className="flex items-center justify-between gap-2">
            {saveError ? <p className="text-sm text-red-700">{saveError}</p> : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCancelDraft} disabled={busy}>
                {tCommon('cancel')}
              </Button>
              <Button variant="primary" onClick={() => void handleSave()} disabled={busy}>
                {busy ? tCommon('saving') : tCommon('save')}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' ? (
        <div className="flex flex-col gap-6">
          <DealDetailsSection
            organizationName={loadState.deal.organization.name}
            draft={loadState.draft}
            contacts={loadState.contacts}
            staffOptions={staffOptions}
            onChange={setDraft}
          />
          <DealStageSection
            deal={loadState.deal}
            busy={stageBusy}
            onStageChange={handleStageChange}
          />
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('sheet.areas')}</h3>
            {loadState.deal.areasSummary.count === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">{t('areas.empty')}</p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                {t('areas.summary', {
                  count: loadState.deal.areasSummary.count,
                  sqm: loadState.deal.areasSummary.totalSqm,
                  labels: loadState.deal.areasSummary.labels.join(', '),
                })}
              </p>
            )}
          </section>
          <DealNotesSection dealId={dealId} />
          <DealAttachmentsSection dealId={dealId} />
        </div>
      ) : null}
    </Sheet>
  );
}
