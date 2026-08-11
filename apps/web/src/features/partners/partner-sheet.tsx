'use client';

import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { deletePartner, getPartner, updatePartner } from '@/lib/api/partners';
import { getOrganization } from '@/lib/api/organizations';
import { listProvisioningRequests } from '@/lib/api/toonexpo';
import type {
  OrganizationContact,
  PartnerListItem,
  PartnerStage,
  UpdatePartnerInput,
} from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { IconMenu, IconMenuCheck } from '@/components/ui/icon-menu';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { Sheet } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { showToast } from '@/components/ui/toast';
import { EntityAttachmentsSection } from '@/features/content/entity-attachments-section';
import { EntityNotesSection } from '@/features/content/entity-notes-section';
import { PARTNER_OWNER, stageTone } from '@/features/partners/constants';
import { ProvisioningRequestDialog } from '@/features/toonexpo/provisioning-request-dialog';
import { EntityAreasSection } from '@/features/venue-map/entity-areas-section';
import {
  PartnerDetailsSection,
  type PartnerDetailsDraft,
} from '@/features/partners/partner-details-section';
import { PartnerStageSection } from '@/features/partners/partner-stage-section';

type StaffOption = {
  id: string;
  name: string;
};

type PartnerSheetProps = {
  partnerId: string | null;
  open: boolean;
  staffOptions: StaffOption[];
  onClose: () => void;
  onUpdated: (partner: PartnerListItem) => void;
  onDeleted: (partnerId: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      partner: PartnerListItem;
      contacts: OrganizationContact[];
      toonexpoCompanyId: string | null;
      hasExpoAccount: boolean;
    };

function toDraft(partner: PartnerListItem): PartnerDetailsDraft {
  return {
    primaryContactId: partner.primaryContact?.id ?? '',
    assignedStaffId: partner.assignedStaff?.id ?? '',
    partnerType: partner.partnerType ?? '',
    description: partner.description ?? '',
  };
}

function draftsEqual(a: PartnerDetailsDraft, b: PartnerDetailsDraft): boolean {
  return (
    a.primaryContactId === b.primaryContactId &&
    a.assignedStaffId === b.assignedStaffId &&
    a.partnerType === b.partnerType &&
    a.description === b.description
  );
}

/** Build a PATCH body with only dirty fields. Explicit null clears relations/scalars. */
function buildDetailsPatch(
  draft: PartnerDetailsDraft,
  baseline: PartnerDetailsDraft,
): UpdatePartnerInput {
  const payload: UpdatePartnerInput = {};

  if (draft.primaryContactId !== baseline.primaryContactId) {
    payload.primaryContactId = draft.primaryContactId || null;
  }
  if (draft.assignedStaffId !== baseline.assignedStaffId) {
    payload.assignedStaffId = draft.assignedStaffId || null;
  }
  if (draft.partnerType !== baseline.partnerType) {
    payload.partnerType = draft.partnerType.trim() || null;
  }
  if (draft.description !== baseline.description) {
    payload.description = draft.description.trim() || null;
  }

  return payload;
}

async function resolveHasExpoAccount(
  organizationId: string,
  eventCycleId: string,
  toonexpoCompanyId: string | null,
): Promise<boolean> {
  if (toonexpoCompanyId) {
    return true;
  }
  const rows = await listProvisioningRequests({ organizationId, cycleId: eventCycleId });
  const latest = rows[0];
  return (
    latest != null && (latest.status === 'SUCCESS' || latest.status === 'LINKED_EXISTING')
  );
}

export function PartnerSheet({
  partnerId,
  open,
  staffOptions,
  onClose,
  onUpdated,
  onDeleted,
}: PartnerSheetProps) {
  const [activeId, setActiveId] = useState<string | null>(partnerId);

  if (open && partnerId && partnerId !== activeId) {
    setActiveId(partnerId);
  }

  if (!activeId) {
    return null;
  }

  return (
    <PartnerSheetInner
      key={activeId}
      open={open && partnerId === activeId}
      partnerId={activeId}
      staffOptions={staffOptions}
      onClose={onClose}
      onUpdated={onUpdated}
      onDeleted={onDeleted}
    />
  );
}

type PartnerSheetInnerProps = {
  open: boolean;
  partnerId: string;
  staffOptions: StaffOption[];
  onClose: () => void;
  onUpdated: (partner: PartnerListItem) => void;
  onDeleted: (partnerId: string) => void;
};

function PartnerSheetInner({
  open,
  partnerId,
  staffOptions,
  onClose,
  onUpdated,
  onDeleted,
}: PartnerSheetInnerProps) {
  const t = useTranslations('partners');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [draft, setDraft] = useState<PartnerDetailsDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stageBusy, setStageBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getPartner(partnerId)
      .then(async (partner) => {
        const detail = await getOrganization(partner.organizationId);
        const hasExpoAccount = await resolveHasExpoAccount(
          partner.organizationId,
          partner.eventCycleId,
          detail.toonexpoCompanyId,
        );
        if (!cancelled) {
          setLoadState({
            status: 'ready',
            partner,
            contacts: detail.contacts,
            toonexpoCompanyId: detail.toonexpoCompanyId,
            hasExpoAccount,
          });
          setDraft(toDraft(partner));
          setEditing(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- partnerId is the load key
  }, [partnerId]);

  const baseline = useMemo(
    () => (loadState.status === 'ready' ? toDraft(loadState.partner) : null),
    [loadState],
  );

  const isDirty = draft != null && baseline != null && !draftsEqual(draft, baseline);

  function updateDraft(updater: (prev: PartnerDetailsDraft) => PartnerDetailsDraft) {
    setDraft((prev) => (prev ? updater(prev) : prev));
  }

  function setPartner(partner: PartnerListItem, syncDraft: boolean) {
    setLoadState((prev) =>
      prev.status === 'ready'
        ? {
            status: 'ready',
            partner,
            contacts: prev.contacts,
            toonexpoCompanyId: prev.toonexpoCompanyId,
            hasExpoAccount: prev.hasExpoAccount,
          }
        : prev,
    );
    if (syncDraft) {
      setDraft(toDraft(partner));
    }
    onUpdated(partner);
  }

  function handleCancelDraft() {
    if (baseline) {
      setDraft(baseline);
    }
    setSaveError(null);
    setEditing(false);
  }

  function handleEdit() {
    setEditing(true);
    window.requestAnimationFrame(() => {
      document.getElementById('partner-contact')?.focus();
    });
  }

  async function handleSave() {
    if (loadState.status !== 'ready' || !draft || !baseline) {
      return;
    }
    const payload = buildDetailsPatch(draft, baseline);
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    setBusy(true);
    setSaveError(null);
    try {
      const updated = await updatePartner(partnerId, payload);
      setPartner(updated, true);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleStageChange(stage: PartnerStage) {
    if (loadState.status !== 'ready') {
      return;
    }
    const previous = loadState.partner;
    if (previous.stage === stage) {
      return;
    }

    const keepDraft = isDirty;
    setPartner({ ...previous, stage }, !keepDraft);
    setStageBusy(true);
    try {
      const updated = await updatePartner(partnerId, { stage });
      setPartner(updated, !keepDraft);
    } catch (err) {
      setPartner(previous, !keepDraft);
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setStageBusy(false);
    }
  }

  async function reloadPartner() {
    try {
      const partner = await getPartner(partnerId);
      const detail = await getOrganization(partner.organizationId);
      const hasExpoAccount = await resolveHasExpoAccount(
        partner.organizationId,
        partner.eventCycleId,
        detail.toonexpoCompanyId,
      );
      setLoadState({
        status: 'ready',
        partner,
        contacts: detail.contacts,
        toonexpoCompanyId: detail.toonexpoCompanyId,
        hasExpoAccount,
      });
      if (!isDirty) {
        setDraft(toDraft(partner));
      }
      onUpdated(partner);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await deletePartner(partnerId);
      setDeleteOpen(false);
      onClose();
      onDeleted(partnerId);
      showToast(t('actions.deleted'), 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const sheetTitle =
    loadState.status === 'ready' ? loadState.partner.organization.name : t('detailTitle');

  const headerActions =
    loadState.status === 'ready' ? (
      <div className="flex items-center gap-2">
        <StatusBadge
          label={t(`stages.${loadState.partner.stage}`)}
          tone={stageTone(loadState.partner.stage)}
        />
        <IconMenu
          label={t('actions.menu')}
          items={[
            {
              id: 'edit',
              label: tCommon('edit'),
              icon: <Pencil className="size-4" aria-hidden />,
              onSelect: handleEdit,
              disabled: editing,
            },
            {
              id: 'delete',
              label: tCommon('delete'),
              icon: <Trash2 className="size-4" aria-hidden />,
              tone: 'danger',
              onSelect: () => setDeleteOpen(true),
            },
            {
              id: 'add-account',
              label: t('actions.addAccount'),
              icon: <UserPlus className="size-4" aria-hidden />,
              onSelect: () => setAccountDialogOpen(true),
              disabled: loadState.hasExpoAccount,
              trailing: loadState.hasExpoAccount ? <IconMenuCheck /> : undefined,
            },
          ]}
        />
      </div>
    ) : null;

  return (
    <>
      <Sheet
        open={open}
        title={sheetTitle}
        headerActions={headerActions}
        onClose={onClose}
        footer={
          editing ? (
            <div className="flex flex-col gap-2">
              {saveError ? <p className="text-sm text-[var(--color-danger)]">{saveError}</p> : null}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelDraft}
                  disabled={busy}
                  className="flex-1"
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => void handleSave()}
                  disabled={busy || !isDirty}
                  className="flex-1"
                >
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
            <PartnerDetailsSection
              draft={draft}
              contacts={loadState.contacts}
              staffOptions={staffOptions}
              readOnly={!editing}
              onChange={updateDraft}
            />
            <PartnerStageSection
              partner={loadState.partner}
              busy={stageBusy}
              onStageChange={handleStageChange}
            />
            <EntityAreasSection
              cycleId={loadState.partner.eventCycleId}
              areas={loadState.partner.areas ?? []}
              target={{ kind: 'PARTNER', partnerId }}
              onChanged={() => void reloadPartner()}
            />
            <EntityNotesSection ownerType={PARTNER_OWNER} ownerId={partnerId} />
            <EntityAttachmentsSection ownerType={PARTNER_OWNER} ownerId={partnerId} />
          </div>
        ) : null}
      </Sheet>

      <Dialog
        open={deleteOpen}
        title={t('actions.deleteTitle')}
        description={t('actions.deleteDescription')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={deleteBusy}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />

      {loadState.status === 'ready' ? (
        <ProvisioningRequestDialog
          open={accountDialogOpen}
          organizationId={loadState.partner.organizationId}
          eventCycleId={loadState.partner.eventCycleId}
          companyType="PARTNER"
          onClose={() => setAccountDialogOpen(false)}
          onCreated={(request) => {
            const linked =
              request.status === 'SUCCESS' || request.status === 'LINKED_EXISTING';
            setLoadState((prev) =>
              prev.status === 'ready'
                ? {
                    ...prev,
                    toonexpoCompanyId: request.toonexpoCompanyId ?? prev.toonexpoCompanyId,
                    hasExpoAccount: linked || prev.hasExpoAccount,
                  }
                : prev,
            );
            setAccountDialogOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
