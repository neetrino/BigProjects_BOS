'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { updateVenuePlan, type VenuePlan } from '@/lib/api/venue-map';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { showToast } from '@/components/ui/toast';
import { computePixelsPerMeter, type ImagePoint } from './domain/grid-transform';

type CalibrationControlsProps = {
  plan: VenuePlan;
  points: readonly ImagePoint[];
  onClearPoints: () => void;
  onSaved: () => void;
};

export function CalibrationControls({
  plan,
  points,
  onClearPoints,
  onSaved,
}: CalibrationControlsProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const [distanceMeters, setDistanceMeters] = useState('');
  const [ppm, setPpm] = useState(
    plan.pixelsPerMeter != null ? String(plan.pixelsPerMeter) : '',
  );
  const [originX, setOriginX] = useState(String(plan.gridOriginX));
  const [originY, setOriginY] = useState(String(plan.gridOriginY));
  const [busy, setBusy] = useState(false);

  async function savePatch(input: {
    pixelsPerMeter?: number;
    gridOriginX?: number;
    gridOriginY?: number;
  }) {
    setBusy(true);
    try {
      await updateVenuePlan(plan.id, input);
      onSaved();
      showToast(t('calibration.saved'), 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function applyTwoPoint() {
    if (points.length !== 2) {
      showToast(t('calibration.needTwoPoints'), 'error');
      return;
    }
    const meters = Number(distanceMeters);
    const computed = computePixelsPerMeter(points[0], points[1], meters);
    if (computed == null) {
      showToast(t('calibration.invalidDistance'), 'error');
      return;
    }
    setPpm(computed.toFixed(4));
    await savePatch({ pixelsPerMeter: computed });
    onClearPoints();
    setDistanceMeters('');
  }

  async function applyManual() {
    const nextPpm = Number(ppm);
    const nextX = Number(originX);
    const nextY = Number(originY);
    if (!Number.isFinite(nextPpm) || nextPpm <= 0) {
      showToast(t('calibration.invalidPpm'), 'error');
      return;
    }
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
      showToast(t('calibration.invalidOrigin'), 'error');
      return;
    }
    await savePatch({
      pixelsPerMeter: nextPpm,
      gridOriginX: nextX,
      gridOriginY: nextY,
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
      <p className="w-full text-xs text-[var(--color-muted)]">
        {t('calibration.hint', { count: points.length })}
      </p>
      <Field label={t('calibration.distance')} htmlFor="cal-distance" className="w-28">
        <TextInput
          id="cal-distance"
          type="number"
          min={0.01}
          step="any"
          value={distanceMeters}
          onChange={(e) => setDistanceMeters(e.target.value)}
          disabled={points.length !== 2}
        />
      </Field>
      <Button
        variant="primary"
        disabled={busy || points.length !== 2}
        onClick={() => void applyTwoPoint()}
      >
        {t('calibration.applyPoints')}
      </Button>
      <Button variant="ghost" disabled={points.length === 0} onClick={onClearPoints}>
        {t('calibration.clearPoints')}
      </Button>
      <Field label={t('calibration.ppm')} htmlFor="cal-ppm" className="w-28">
        <TextInput
          id="cal-ppm"
          type="number"
          min={0.01}
          step="any"
          value={ppm}
          onChange={(e) => setPpm(e.target.value)}
        />
      </Field>
      <Field label={t('calibration.originX')} htmlFor="cal-ox" className="w-24">
        <TextInput
          id="cal-ox"
          type="number"
          step="any"
          value={originX}
          onChange={(e) => setOriginX(e.target.value)}
        />
      </Field>
      <Field label={t('calibration.originY')} htmlFor="cal-oy" className="w-24">
        <TextInput
          id="cal-oy"
          type="number"
          step="any"
          value={originY}
          onChange={(e) => setOriginY(e.target.value)}
        />
      </Field>
      <Button variant="secondary" disabled={busy} onClick={() => void applyManual()}>
        {busy ? tCommon('saving') : t('calibration.saveManual')}
      </Button>
    </div>
  );
}
