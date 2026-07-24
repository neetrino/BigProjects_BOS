'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import type { EntityAreaRef } from '@/lib/api/types';
import {
  createSpaceAllocation,
  getVenuePlan,
  releaseSpaceAllocation,
  type VenueSpaceArea,
} from '@/lib/api/venue-map';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, SearchInput } from '@/components/ui/field';
import { ModalFrame } from '@/components/ui/modal-frame';
import { showToast } from '@/components/ui/toast';

type EntityAreasSectionProps = {
  cycleId: string;
  areas: readonly EntityAreaRef[];
  /** Builder deal id XOR partner participation id for assign. */
  target: { kind: 'BUILDER'; dealId: string } | { kind: 'PARTNER'; partnerId: string };
  onChanged: () => void;
};

export function EntityAreasSection({ cycleId, areas, target, onChanged }: EntityAreasSectionProps) {
  const t = useTranslations('entityAreas');
  const tCommon = useTranslations('common');
  const [assignOpen, setAssignOpen] = useState(false);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRelease() {
    if (!releaseId) {
      return;
    }
    setBusy(true);
    try {
      await releaseSpaceAllocation(releaseId);
      setReleaseId(null);
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('title')}</h3>
      {areas.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {areas.map((area) => (
            <li
              key={area.allocationId}
              className="flex items-center justify-between gap-2 rounded px-1 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--color-fg)]">
                  {area.name}
                  {area.code ? ` (${area.code})` : ''}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{area.squareMeters} m²</p>
              </div>
              <Button variant="ghost" onClick={() => setReleaseId(area.allocationId)}>
                {t('release')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" onClick={() => setAssignOpen(true)} className="self-end">
        {t('assign')}
      </Button>

      <AssignFreeAreaDialog
        open={assignOpen}
        cycleId={cycleId}
        target={target}
        onAssigned={() => {
          setAssignOpen(false);
          onChanged();
        }}
        onClose={() => setAssignOpen(false)}
      />
      <Dialog
        open={releaseId !== null}
        title={t('releaseTitle')}
        description={t('releaseDescription')}
        confirmLabel={t('release')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => void handleRelease()}
        onCancel={() => setReleaseId(null)}
      />
    </section>
  );
}

type AssignFreeAreaDialogProps = {
  open: boolean;
  cycleId: string;
  target: EntityAreasSectionProps['target'];
  onAssigned: () => void;
  onClose: () => void;
};

function AssignFreeAreaDialog({
  open,
  cycleId,
  target,
  onAssigned,
  onClose,
}: AssignFreeAreaDialogProps) {
  return (
    <AssignFreeAreaDialogInner
      open={open}
      cycleId={cycleId}
      target={target}
      onAssigned={onAssigned}
      onClose={onClose}
    />
  );
}

type AssignFreeAreaDialogInnerProps = {
  open: boolean;
  cycleId: string;
  target: EntityAreasSectionProps['target'];
  onAssigned: () => void;
  onClose: () => void;
};

function AssignFreeAreaDialogInner({
  open,
  cycleId,
  target,
  onAssigned,
  onClose,
}: AssignFreeAreaDialogInnerProps) {
  const t = useTranslations('entityAreas');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const [freeAreas, setFreeAreas] = useState<VenueSpaceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSearch('');
    setLoading(true);
    setBusyId(null);
    let cancelled = false;
    void getVenuePlan(cycleId)
      .then((response) => {
        if (!cancelled) {
          const free = (response.plan?.areas ?? []).filter((area) => area.allocation === null);
          setFreeAreas(free);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, cycleId, tCommon]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return freeAreas;
    }
    return freeAreas.filter(
      (area) => area.name.toLowerCase().includes(q) || (area.code ?? '').toLowerCase().includes(q),
    );
  }, [freeAreas, search]);

  async function handleAssign(areaId: string) {
    setBusyId(areaId);
    try {
      if (target.kind === 'BUILDER') {
        await createSpaceAllocation(areaId, { builderDealId: target.dealId });
      } else {
        await createSpaceAllocation(areaId, { partnerParticipationId: target.partnerId });
      }
      onAssigned();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      busy={busyId !== null}
      labelledBy="entity-assign-title"
      panelClassName="flex max-h-[80vh] max-w-md flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lift)]"
    >
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2
          id="entity-assign-title"
          className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]"
        >
          {t('assignTitle')}
        </h2>
        <div className="mt-3">
          <Field label={t('search')} htmlFor="entity-assign-search">
            <SearchInput
              id="entity-assign-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
            />
          </Field>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <p className="py-4 text-sm text-[var(--color-muted)]">{tCommon('loading')}</p>
        ) : null}
        {!loading && filtered.length === 0 ? (
          <p className="py-4 text-sm text-[var(--color-muted)]">{t('noFreeAreas')}</p>
        ) : null}
        {!loading ? (
          <ul className="flex flex-col gap-1">
            {filtered.map((area) => (
              <li
                key={area.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-2 hover:bg-[var(--color-bg)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-fg)]">
                    {area.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{area.squareMeters} m²</p>
                </div>
                <Button
                  variant="primary"
                  disabled={busyId !== null}
                  onClick={() => void handleAssign(area.id)}
                >
                  {busyId === area.id ? tCommon('saving') : t('pick')}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <Button variant="secondary" onClick={onClose}>
          {tCommon('cancel')}
        </Button>
      </div>
    </ModalFrame>
  );
}
