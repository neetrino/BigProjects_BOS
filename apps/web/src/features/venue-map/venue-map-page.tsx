'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listCycles } from '@/lib/api/cycles';
import { getVenuePlan, type VenuePlan } from '@/lib/api/venue-map';
import type { EventCycle } from '@/lib/api/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { SelectInput } from '@/components/ui/field';
import { useCycleQueryParam } from '@/hooks/use-cycle-query-param';
import { CalibrationControls } from './calibration-controls';
import { CreateAreaDialog } from './create-area-dialog';
import { CreatePlanForm } from './create-plan-form';
import type { GridCell, ImagePoint } from './domain/grid-transform';
import { UploadPlanImage } from './upload-plan-image';
import type { EditorInteractionMode } from './venue-map-stage';
import { VenueMapPublicationSection } from '@/features/toonexpo/venue-map-publication-section';
import { VenueMapPanel } from './venue-map-panel';
import { VenueMapStageClient } from './venue-map-stage-client';

type CyclesLoad =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cycles: EventCycle[] };

type PlanLoad =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; plan: VenuePlan | null };

export function VenueMapPage() {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const [cyclesLoad, setCyclesLoad] = useState<CyclesLoad>({ status: 'loading' });
  const cyclesReady = cyclesLoad.status === 'ready' ? cyclesLoad.cycles : null;
  const { cycleId, setCycleId } = useCycleQueryParam(cyclesReady);
  const [planLoad, setPlanLoad] = useState<PlanLoad>({ status: 'idle' });
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<EditorInteractionMode>('select');
  const [calibrationPoints, setCalibrationPoints] = useState<ImagePoint[]>([]);
  const [pendingSelection, setPendingSelection] = useState<GridCell[]>([]);
  const [fitRequestId, setFitRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listCycles()
      .then((cycles) => {
        if (cancelled) {
          return;
        }
        setCyclesLoad({ status: 'ready', cycles });
        if (cycles.length > 0) {
          setPlanLoad({ status: 'loading' });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCyclesLoad({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tCommon]);

  function handleCycleChange(nextId: string) {
    setCycleId(nextId);
    setPlanLoad({ status: 'loading' });
    setSelectedAreaId(null);
    setPendingSelection([]);
    setCalibrationPoints([]);
    setInteractionMode('select');
  }

  const refreshPlan = useCallback(() => {
    setPlanLoad({ status: 'loading' });
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!cycleId) {
      return;
    }
    let cancelled = false;
    void getVenuePlan(cycleId)
      .then((response) => {
        if (!cancelled) {
          setPlanLoad({ status: 'ready', plan: response.plan });
          setSelectedAreaId((prev) => {
            if (!prev || !response.plan) {
              return null;
            }
            return response.plan.areas.some((area) => area.id === prev) ? prev : null;
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPlanLoad({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cycleId, reloadToken, tCommon]);

  const plan = planLoad.status === 'ready' ? planLoad.plan : null;
  const selectedArea = useMemo(
    () => plan?.areas.find((area) => area.id === selectedAreaId) ?? null,
    [plan, selectedAreaId],
  );
  const hasImage = Boolean(plan?.imageUrl && plan.imageWidth && plan.imageHeight);
  const isCalibrated = Boolean(plan?.pixelsPerMeter && plan.pixelsPerMeter > 0);

  if (cyclesLoad.status === 'loading') {
    return <LoadingState message={tCommon('loading')} />;
  }
  if (cyclesLoad.status === 'error') {
    return <ErrorState message={cyclesLoad.message} />;
  }
  if (cyclesLoad.cycles.length === 0) {
    return <EmptyState message={t('emptyNoCycles')} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-heading">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            {t('toolbar.cycle')}
            <SelectInput
              value={cycleId}
              onChange={(event) => handleCycleChange(event.target.value)}
              className="min-w-[12rem]"
              fitContent
            >
              {cyclesLoad.cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                  {cycle.status === 'ACTIVE' ? ` (${t('toolbar.active')})` : ''}
                </option>
              ))}
            </SelectInput>
          </label>
          {hasImage ? (
            <>
              <Button
                variant={interactionMode === 'select' ? 'primary' : 'secondary'}
                onClick={() => setInteractionMode('select')}
              >
                {t('toolbar.select')}
              </Button>
              <Button
                variant={interactionMode === 'pan' ? 'primary' : 'secondary'}
                onClick={() => setInteractionMode('pan')}
              >
                {t('toolbar.pan')}
              </Button>
              {isAdmin ? (
                <Button
                  variant={interactionMode === 'calibrate' ? 'primary' : 'secondary'}
                  onClick={() => setInteractionMode('calibrate')}
                >
                  {t('toolbar.calibrate')}
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setFitRequestId((id) => id + 1)}>
                {t('toolbar.fit')}
              </Button>
              {isAdmin && plan ? (
                <UploadPlanImage planId={plan.id} onUploaded={refreshPlan} compact />
              ) : null}
            </>
          ) : null}
        </div>
      </header>

      {!cycleId ? <EmptyState message={t('selectCycle')} /> : null}

      {cycleId && planLoad.status === 'loading' ? (
        <LoadingState message={tCommon('loading')} />
      ) : null}
      {cycleId && planLoad.status === 'error' ? <ErrorState message={planLoad.message} /> : null}

      {cycleId && planLoad.status === 'ready' && !plan ? (
        isAdmin ? (
          <CreatePlanForm cycleId={cycleId} onCreated={refreshPlan} />
        ) : (
          <EmptyState message={t('noPlanStaff')} />
        )
      ) : null}

      {cycleId && plan && !hasImage ? (
        isAdmin ? (
          <UploadPlanImage planId={plan.id} onUploaded={refreshPlan} />
        ) : (
          <EmptyState message={t('noImageStaff')} />
        )
      ) : null}

      {cycleId && plan && hasImage ? (
        <>
          {isAdmin ? (
            <VenueMapPublicationSection
              planId={plan.id}
              publishStatus={plan.publishStatus}
              onPublished={refreshPlan}
            />
          ) : null}
          {isAdmin && interactionMode === 'calibrate' ? (
            <CalibrationControls
              plan={plan}
              points={calibrationPoints}
              onClearPoints={() => setCalibrationPoints([])}
              onSaved={refreshPlan}
            />
          ) : null}
          {!isCalibrated ? (
            <p className="text-sm text-[var(--color-muted)]">{t('uncalibratedHint')}</p>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">{t('selectHint')}</p>
          )}
          <div className="panel flex min-h-0 flex-1 overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1">
              <VenueMapStageClient
                plan={plan}
                selectedAreaId={selectedAreaId}
                interactionMode={interactionMode}
                pendingSelection={pendingSelection}
                onSelectArea={setSelectedAreaId}
                onSelectionComplete={(cells) => {
                  if (interactionMode === 'select' && isCalibrated) {
                    setPendingSelection(cells);
                  }
                }}
                onCalibrationPointsChange={setCalibrationPoints}
                calibrationPoints={calibrationPoints}
                fitRequestId={fitRequestId}
              />
            </div>
            <VenueMapPanel
              area={selectedArea}
              cycleId={cycleId}
              areas={plan.areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={setSelectedAreaId}
              onChanged={() => {
                setPendingSelection([]);
                refreshPlan();
              }}
            />
          </div>
          <CreateAreaDialog
            open={pendingSelection.length > 0}
            planId={plan.id}
            cells={pendingSelection}
            onCreated={() => {
              setPendingSelection([]);
              refreshPlan();
            }}
            onCancel={() => setPendingSelection([])}
          />
        </>
      ) : null}
    </div>
  );
}
