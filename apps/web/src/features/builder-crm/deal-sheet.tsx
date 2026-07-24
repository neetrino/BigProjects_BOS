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
import { StatusBadge } from '@/components/ui/status-badge';
import { showToast } from '@/components/ui/toast';
import {
  DealDetailsSection,
  type DealDetailsDraft,
} from '@/features/builder-crm/deal-details-section';
import { DealStageSection } from '@/features/builder-crm/deal-stage-section';
import { EntityAttachmentsSection } from '@/features/content/entity-attachments-section';
import { EntityNotesSection } from '@/features/content/entity-notes-section';
import { BUILDER_DEAL_OWNER, stageTone } from '@/features/builder-crm/constants';
import { ToonExpoAccountSection } from '@/features/toonexpo/toonexpo-account-section';
import { EntityAreasSection } from '@/features/venue-map/entity-areas-section';

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
      contacts: OrganizationContact[];
      toonexpoCompanyId: string | null;
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

function draftsEqual(a: DealDetailsDraft, b: DealDetailsDraft): boolean {
  return (
    a.primaryContactId === b.primaryContactId &&
    a.assignedStaffId === b.assignedStaffId &&
    a.expectedSqm === b.expectedSqm &&
    a.agreedAmount === b.agreedAmount &&
    a.description === b.description
  );
}

/** Build a PATCH body with only dirty fields. Explicit null clears relations/scalars. */
function buildDetailsPatch(draft: DealDetailsDraft, baseline: DealDetailsDraft): UpdateDealInput {
  const payload: UpdateDealInput = {};

  if (draft.primaryContactId !== baseline.primaryContactId) {
    payload.primaryContactId = draft.primaryContactId || null;
  }
  if (draft.assignedStaffId !== baseline.assignedStaffId) {
    payload.assignedStaffId = draft.assignedStaffId || null;
  }
  if (draft.expectedSqm !== baseline.expectedSqm) {
    const raw = draft.expectedSqm.trim();
    if (!raw) {
      payload.expectedSqm = null;
    } else {
      const parsed = Number(raw);
      payload.expectedSqm =
        Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
    }
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
  const [activeId, setActiveId] = useState<string | null>(dealId);

  useEffect(() => {
    if (open && dealId) {
      setActiveId(dealId);
    }
  }, [open, dealId]);

  if (!activeId) {
    return null;
  }

  return (
    <DealSheetInner
      key={activeId}
      open={open && dealId === activeId}
      dealId={activeId}
      staffOptions={staffOptions}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}

type DealSheetInnerProps = {
  open: boolean;
  dealId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onUpdated: (deal: DealListItem) => void;
};

function DealSheetInner({
  open,
  dealId,
  staffOptions,
  onClose,
  onUpdated,
}: DealSheetInnerProps) {
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
          setLoadState({
            status: 'ready',
            deal,
            contacts: detail.contacts,
            toonexpoCompanyId: detail.toonexpoCompanyId,
          });
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
      prev.status === 'ready'
        ? {
            status: 'ready',
            deal,
            contacts: prev.contacts,
            toonexpoCompanyId: prev.toonexpoCompanyId,
          }
        : prev,
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

  async function handleStageChange(stage: DealStage, options?: { releaseAreas?: boolean }) {
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
      const updated = await updateDeal(dealId, {
        stage,
        ...(stage === 'LOST' && options?.releaseAreas !== undefined
          ? { releaseAreas: options.releaseAreas }
          : {}),
      });
      setDeal(updated, !keepDraft);
    } catch (err) {
      setDeal(previous, !keepDraft);
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setStageBusy(false);
    }
  }

  async function reloadDeal() {
    try {
      const deal = await getDeal(dealId);
      const detail = await getOrganization(deal.organizationId);
      setLoadState({
        status: 'ready',
        deal,
        contacts: detail.contacts,
        toonexpoCompanyId: detail.toonexpoCompanyId,
      });
      if (!isDirty) {
        setDraft(toDraft(deal));
      }
      onUpdated(deal);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    }
  }

  const sheetTitle =
    loadState.status === 'ready' ? loadState.deal.organization.name : t('detailTitle');
  const stageBadge =
    loadState.status === 'ready' ? (
      <StatusBadge
        label={t(`stages.${loadState.deal.stage}`)}
        tone={stageTone(loadState.deal.stage)}
      />
    ) : null;

  return (
    <Sheet
      open={open}
      title={sheetTitle}
      headerActions={stageBadge}
      onClose={onClose}
      footer={
        isDirty ? (
          <div className="flex flex-col gap-2">
            {saveError ? (
              <p className="text-sm text-[var(--color-danger)]">{saveError}</p>
            ) : null}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCancelDraft} disabled={busy} className="flex-1">
                {tCommon('cancel')}
              </Button>
              <Button variant="primary" onClick={() => void handleSave()} disabled={busy} className="flex-1">
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
          <EntityAreasSection
            cycleId={loadState.deal.eventCycleId}
            areas={loadState.deal.areas ?? []}
            target={{ kind: 'BUILDER', dealId: dealId }}
            onChanged={() => void reloadDeal()}
          />
          <ToonExpoAccountSection
            organizationId={loadState.deal.organizationId}
            eventCycleId={loadState.deal.eventCycleId}
            companyType="BUILDER"
            toonexpoCompanyId={loadState.toonexpoCompanyId}
          />
          <EntityNotesSection ownerType={BUILDER_DEAL_OWNER} ownerId={dealId} />
          <EntityAttachmentsSection ownerType={BUILDER_DEAL_OWNER} ownerId={dealId} />
        </div>
      ) : null}
    </Sheet>
  );
}
