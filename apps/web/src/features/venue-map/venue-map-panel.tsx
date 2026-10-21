'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import {
  deleteSpaceArea,
  releaseSpaceAllocation,
  updateSpaceArea,
  type PublicDisplayMode,
  type VenueSpaceArea,
} from '@/lib/api/venue-map';
import { formatAmount, formatSqm } from '@/lib/format';
import { dealStageTone, partnerStageTone } from '@/lib/stage-colors';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, SelectInput, TextInput } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { showToast } from '@/components/ui/toast';
import { AssignAreaDialog } from './assign-area-dialog';
import { BoothList } from './booth-list';
import { MapBoothDetail } from './map-booth-detail';
import type { MapBoothPick } from './toonexpo-venue-map-bridge';

type VenueMapPanelProps = {
  area: VenueSpaceArea | null;
  booth: MapBoothPick | null;
  cycleId: string;
  areas: readonly VenueSpaceArea[];
  mapBooths: readonly MapBoothPick[];
  selectedAreaId: string | null;
  selectedBoothId: string | null;
  onSelectArea: (areaId: string | null) => void;
  onSelectBooth: (booth: MapBoothPick | null) => void;
  onSavePosition: () => void;
  savePositionBusy: boolean;
  onChanged: () => void;
};

export function VenueMapPanel({
  area,
  booth,
  cycleId,
  areas,
  mapBooths,
  selectedAreaId,
  selectedBoothId,
  onSelectArea,
  onSelectBooth,
  onSavePosition,
  savePositionBusy,
  onChanged,
}: VenueMapPanelProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const selectedBooth = area ? null : booth;
  const list = (
    <BoothList
      areas={areas}
      mapBooths={mapBooths}
      selectedAreaId={selectedAreaId}
      selectedBoothId={selectedBoothId}
      onSelectArea={onSelectArea}
      onSelectBooth={onSelectBooth}
    />
  );

  if (!area && !selectedBooth) {
    return (
      <aside className="flex min-h-0 w-80 shrink-0 flex-col gap-3 border-l border-[var(--color-border)] bg-[var(--color-bg-warm)]/40 p-4">
        <h2 className="shrink-0 font-[family-name:var(--font-display)] text-lg font-medium tracking-tight text-[var(--color-fg)]">
          {t('panel.title')}
        </h2>
        <p className="shrink-0 text-sm text-[var(--color-muted)]">{t('panel.selectHint')}</p>
        {list}
      </aside>
    );
  }

  return (
    <aside className="flex min-h-0 w-80 shrink-0 flex-col gap-3 border-l border-[var(--color-border)] bg-[var(--color-bg-warm)]/40 p-4">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-fg)]">{t('panel.detail')}</h2>
        <Button variant="ghost" onClick={() => onSelectArea(null)}>
          {t('panel.back')}
        </Button>
      </div>
      <div className="soft-scrollbar min-h-0 flex-1 overflow-y-auto">
        {area ? (
          <AreaDetailForm key={area.id} area={area} cycleId={cycleId} onChanged={onChanged} />
        ) : selectedBooth ? (
          <MapBoothDetail booth={selectedBooth} />
        ) : null}
        <div className="mt-3">
          <Button variant="primary" disabled={savePositionBusy} onClick={onSavePosition}>
            {savePositionBusy ? tCommon('saving') : t('panel.savePosition')}
          </Button>
        </div>
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">{list}</div>
      </div>
    </aside>
  );
}

type AreaDetailFormProps = {
  area: VenueSpaceArea;
  cycleId: string;
  onChanged: () => void;
};

function AreaDetailForm({ area, cycleId, onChanged }: AreaDetailFormProps) {
  const t = useTranslations('venueMap');
  const tBuilder = useTranslations('builderSales');
  const tPartners = useTranslations('partners');
  const tCommon = useTranslations('common');
  const [name, setName] = useState(area.name);
  const [code, setCode] = useState(area.code ?? '');
  const [displayMode, setDisplayMode] = useState<PublicDisplayMode>(area.publicDisplayMode);
  const [customLabel, setCustomLabel] = useState(area.customPublicLabel ?? '');
  const [busy, setBusy] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty =
    name.trim() !== area.name ||
    (code.trim() || null) !== (area.code ?? null) ||
    displayMode !== area.publicDisplayMode ||
    (customLabel.trim() || null) !== (area.customPublicLabel ?? null);

  async function handleSave() {
    if (displayMode === 'CUSTOM_LABEL' && !customLabel.trim()) {
      showToast(t('panel.customLabelRequired'), 'error');
      return;
    }
    setBusy(true);
    try {
      await updateSpaceArea(area.id, {
        name: name.trim(),
        code: code.trim() || null,
        publicDisplayMode: displayMode,
        customPublicLabel: displayMode === 'CUSTOM_LABEL' ? customLabel.trim() : null,
      });
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease() {
    if (!area.allocation) {
      return;
    }
    setBusy(true);
    try {
      await releaseSpaceAllocation(area.allocation.id);
      setConfirmRelease(false);
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteSpaceArea(area.id);
      setConfirmDelete(false);
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('panel.name')} htmlFor="area-name">
        <TextInput id="area-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label={t('panel.code')} htmlFor="area-code">
        <TextInput id="area-code" value={code} onChange={(e) => setCode(e.target.value)} />
      </Field>
      <p className="text-sm text-[var(--color-muted)]">
        {t('panel.squareMeters', { sqm: area.squareMeters })}
      </p>
      <Field label={t('panel.displayMode')} htmlFor="area-display">
        <SelectInput
          id="area-display"
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value as PublicDisplayMode)}
        >
          <option value="ORGANIZATION">{t('displayMode.ORGANIZATION')}</option>
          <option value="CUSTOM_LABEL">{t('displayMode.CUSTOM_LABEL')}</option>
          <option value="HIDDEN">{t('displayMode.HIDDEN')}</option>
        </SelectInput>
      </Field>
      {displayMode === 'CUSTOM_LABEL' ? (
        <Field label={t('panel.customLabel')} htmlFor="area-custom-label">
          <TextInput
            id="area-custom-label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
        </Field>
      ) : null}
      {dirty ? (
        <Button variant="primary" disabled={busy} onClick={() => void handleSave()}>
          {busy ? tCommon('saving') : tCommon('save')}
        </Button>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {t('panel.allocation')}
        </h3>
        {area.allocation ? (
          <>
            <p className="text-sm font-medium text-[var(--color-fg)]">
              {area.allocation.organizationName}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-[var(--color-muted)]">
                {t(`allocationKind.${area.allocation.kind}`)}
              </p>
              {area.allocation.kind === 'BUILDER' && area.allocation.deal ? (
                <StatusBadge
                  label={tBuilder(`stages.${area.allocation.deal.stage}`)}
                  tone={dealStageTone(area.allocation.deal.stage)}
                />
              ) : null}
              {area.allocation.kind === 'PARTNER' && area.allocation.partner ? (
                <StatusBadge
                  label={tPartners(`stages.${area.allocation.partner.stage}`)}
                  tone={partnerStageTone(area.allocation.partner.stage)}
                />
              ) : null}
            </div>
            {area.allocation.kind === 'BUILDER' && area.allocation.deal ? (
              <div className="flex flex-col gap-1.5">
                {area.allocation.deal.amount != null ? (
                  <p className="text-xs text-[var(--color-muted)]">
                    {t('panel.dealAmount', {
                      value: formatAmount(area.allocation.deal.amount),
                    })}
                  </p>
                ) : null}
                {formatSqm(area.allocation.deal.expectedSqm) ? (
                  <p className="text-xs text-[var(--color-muted)]">
                    {tBuilder('card.expectedSqm', {
                      value: formatSqm(area.allocation.deal.expectedSqm),
                    })}
                  </p>
                ) : null}
                {area.allocation.deal.primaryContactName ? (
                  <p className="text-xs text-[var(--color-muted)]">
                    {t('panel.primaryContact', {
                      name: area.allocation.deal.primaryContactName,
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
            <Button variant="secondary" disabled={busy} onClick={() => setConfirmRelease(true)}>
              {t('panel.release')}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => setAssignOpen(true)}>
            {t('panel.assign')}
          </Button>
        )}
      </div>

      {!area.allocation ? (
        <Button variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
          {t('panel.delete')}
        </Button>
      ) : null}

      <AssignAreaDialog
        open={assignOpen}
        areaId={area.id}
        cycleId={cycleId}
        onAssigned={() => {
          setAssignOpen(false);
          onChanged();
        }}
        onClose={() => setAssignOpen(false)}
      />
      <Dialog
        open={confirmRelease}
        title={t('panel.releaseTitle')}
        description={t('panel.releaseDescription')}
        confirmLabel={t('panel.release')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => void handleRelease()}
        onCancel={() => setConfirmRelease(false)}
      />
      <Dialog
        open={confirmDelete}
        title={t('panel.deleteTitle')}
        description={t('panel.deleteDescription', { name: area.name })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
