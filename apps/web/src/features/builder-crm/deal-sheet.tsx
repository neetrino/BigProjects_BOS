'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { getDeal, updateDeal } from '@/lib/api/deals';
import { getOrganization } from '@/lib/api/organizations';
import type {
  DealListItem,
  DealStage,
  OrganizationContact,
  UpdateDealInput,
} from '@/lib/api/types';
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
  | { status: 'ready'; deal: DealListItem; contacts: OrganizationContact[] };

function toDraft(deal: DealListItem): DealDetailsDraft {
  return {
    primaryContactId: deal.primaryContact?.id ?? '',
    assignedStaffId: deal.assignedStaff?.id ?? '',
    expectedSqm: deal.expectedSqm != null ? String(deal.expectedSqm) : '',
    agreedAmount: deal.agreedAmount != null ? String(deal.agreedAmount) : '',
    description: deal.description ?? '',
  };
}

function draftsEqual(a: DealDetailsDraft, b: DealDetailsDraft): boolean {
  return (
    a.primaryContactId === b.primaryContactId &&
    a.assignedStaffId === b.assignedStaffId &&
    a.expectedSqm === b.expectedSqm &&
    a.agreedAmount === b.agreedAmount &&
    a.description === b.description
  );
}

/** Build a PATCH body with only dirty fields. Never send null relation ids (API connect fails). */
function buildDetailsPatch(draft: DealDetailsDraft, baseline: DealDetailsDraft): UpdateDealInput {
  const payload: UpdateDealInput = {};

  if (draft.primaryContactId !== baseline.primaryContactId && draft.primaryContactId) {
    payload.primaryContactId = draft.primaryContactId;
  }
  if (draft.assignedStaffId !== baseline.assignedStaffId && draft.assignedStaffId) {
    payload.assignedStaffId = draft.assignedStaffId;
  }
  if (draft.expectedSqm !== baseline.expectedSqm) {
    const raw = draft.expectedSqm.trim();
    const parsed = raw ? Number(raw) : null;
    payload.expectedSqm = parsed != null && !Number.isNaN(parsed) ? parsed : null;
  }
  if (draft.agreedAmount !== baseline.agreedAmount) {
    payload.agreedAmount = draft.agreedAmount.trim() || null;
  }
  if (draft.description !== baseline.description) {
    payload.description = draft.description.trim() || null;
  }

  return payload;
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
  const [draft, setDraft] = useState<DealDetailsDraft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stageBusy, setStageBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getDeal(dealId)
      .then(async (deal) => {
        const detail = await getOrganization(deal.organizationId);
        if (!cancelled) {
          setLoadState({ status: 'ready', deal, contacts: detail.contacts });
          setDraft(toDraft(deal));
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
    // tCommon omitted: next-intl identity changes would re-fetch and reset draft mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dealId is the load key
  }, [dealId]);

  const baseline = useMemo(
    () => (loadState.status === 'ready' ? toDraft(loadState.deal) : null),
    [loadState],
  );

  const isDirty = draft != null && baseline != null && !draftsEqual(draft, baseline);

  function updateDraft(updater: (prev: DealDetailsDraft) => DealDetailsDraft) {
    setDraft((prev) => (prev ? updater(prev) : prev));
  }

  function setDeal(deal: DealListItem, syncDraft: boolean) {
    setLoadState((prev) =>
      prev.status === 'ready' ? { status: 'ready', deal, contacts: prev.contacts } : prev,
    );
    if (syncDraft) {
      setDraft(toDraft(deal));
    }
    onUpdated(deal);
  }

  function handleCancelDraft() {
    if (baseline) {
      setDraft(baseline);
    }
    setSaveError(null);
  }

  async function handleSave() {
    if (loadState.status !== 'ready' || !draft || !baseline) {
      return;
    }
    const payload = buildDetailsPatch(draft, baseline);
    if (Object.keys(payload).length === 0) {
      return;
    }

    setBusy(true);
    setSaveError(null);
    try {
      const updated = await updateDeal(dealId, payload);
      setDeal(updated, true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleStageChange(stage: DealStage) {
    if (loadState.status !== 'ready') {
      return;
    }
    const previous = loadState.deal;
    if (previous.stage === stage) {
      return;
    }

    const keepDraft = isDirty;
    setDeal({ ...previous, stage }, !keepDraft);
    setStageBusy(true);
    try {
      const updated = await updateDeal(dealId, { stage });
      setDeal(updated, !keepDraft);
    } catch (err) {
      setDeal(previous, !keepDraft);
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
      {loadState.status === 'ready' && draft ? (
        <div className="flex flex-col gap-6">
          <DealDetailsSection
            organizationName={loadState.deal.organization.name}
            draft={draft}
            contacts={loadState.contacts}
            staffOptions={staffOptions}
            onChange={updateDraft}
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
