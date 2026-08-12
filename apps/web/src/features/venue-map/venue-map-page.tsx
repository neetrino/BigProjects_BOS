'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Hand, Maximize2, Minimize2, MousePointer2, Ruler, Scan } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { getVenuePlan, type VenuePlan } from '@/lib/api/venue-map';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';
import { CalibrationControls } from './calibration-controls';
import { CreateAreaDialog } from './create-area-dialog';
import { CreatePlanForm } from './create-plan-form';
import type { GridCell, ImagePoint } from './domain/grid-transform';
import { UploadPlanImage } from './upload-plan-image';
import type { EditorInteractionMode } from './venue-map-stage';
import { VenueMapPublicationSection } from '@/features/toonexpo/venue-map-publication-section';
import { VenueMapPanel } from './venue-map-panel';
import { VenueMapStageClient } from './venue-map-stage-client';
import { TOOLBAR_CONTROL_CLASS } from './constants';

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
  const { cycleId, cycles, status: cyclesStatus, errorMessage: cyclesError } = useActiveCycle();

  const planCacheKey = cycleId ? CLIENT_CACHE_KEYS.venuePlan(cycleId) : 'venue-plan:idle';
  const [planLoad, setPlanLoad] = useClientCachedState<PlanLoad>(planCacheKey, {
    status: cycleId ? 'loading' : 'idle',
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<EditorInteractionMode>('select');
  const [calibrationPoints, setCalibrationPoints] = useState<ImagePoint[]>([]);
  const [pendingSelection, setPendingSelection] = useState<GridCell[]>([]);
  const [fitRequestId, setFitRequestId] = useState(0);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [editorCycleId, setEditorCycleId] = useState(cycleId);

  if (cycleId !== editorCycleId) {
    setEditorCycleId(cycleId);
    setSelectedAreaId(null);
    setPendingSelection([]);
    setCalibrationPoints([]);
    setInteractionMode('select');
  }

  useEffect(() => {
    if (!mapFullscreen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMapFullscreen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mapFullscreen]);

  useEffect(() => {
    if (!mapFullscreen) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setFitRequestId((id) => id + 1);
    }, 80);
    return () => window.clearTimeout(timerId);
  }, [mapFullscreen]);

  const refreshPlan = useCallback(() => {
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
  }, [cycleId, reloadToken, setPlanLoad, tCommon]);

  const plan = planLoad.status === 'ready' ? planLoad.plan : null;
  const selectedArea = useMemo(
    () => plan?.areas.find((area) => area.id === selectedAreaId) ?? null,
    [plan, selectedAreaId],
  );
  const hasImage = Boolean(plan?.imageUrl && plan.imageWidth && plan.imageHeight);
  const isCalibrated = Boolean(plan?.pixelsPerMeter && plan.pixelsPerMeter > 0);

  if (cyclesStatus === 'loading') {
    return <LoadingState message={tCommon('loading')} />;
  }
  if (cyclesStatus === 'error' && cyclesError) {
    return <ErrorState message={cyclesError} />;
  }
  if (cycles.length === 0) {
    return <EmptyState message={t('emptyNoCycles')} />;
  }

  return (
    <div
      className={clsx(
        'flex min-h-0 flex-1 flex-col gap-5',
        mapFullscreen && 'fixed inset-0 z-[60] bg-[var(--color-bg)] p-4',
      )}
    >
      <header className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-heading">{t('title')}</h1>
        </div>
        {hasImage ? (
          <div className="ml-auto flex flex-wrap items-end justify-end gap-2">
            <Button
              variant={interactionMode === 'select' ? 'primary' : 'secondary'}
              className={TOOLBAR_CONTROL_CLASS}
              onClick={() => setInteractionMode('select')}
            >
              <MousePointer2 className="size-4" aria-hidden />
              {t('toolbar.select')}
            </Button>
            <Button
              variant={interactionMode === 'pan' ? 'primary' : 'secondary'}
              className={TOOLBAR_CONTROL_CLASS}
              onClick={() => setInteractionMode('pan')}
            >
              <Hand className="size-4" aria-hidden />
              {t('toolbar.pan')}
            </Button>
            {isAdmin ? (
              <Button
                variant={interactionMode === 'calibrate' ? 'primary' : 'secondary'}
                className={TOOLBAR_CONTROL_CLASS}
                onClick={() => setInteractionMode('calibrate')}
              >
                <Ruler className="size-4" aria-hidden />
                {t('toolbar.calibrate')}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              className={TOOLBAR_CONTROL_CLASS}
              onClick={() => setFitRequestId((id) => id + 1)}
            >
              <Scan className="size-4" aria-hidden />
              {t('toolbar.fit')}
            </Button>
            {isAdmin && plan ? (
              <UploadPlanImage planId={plan.id} onUploaded={refreshPlan} compact />
            ) : null}
            <Button
              variant={mapFullscreen ? 'primary' : 'secondary'}
              className={TOOLBAR_CONTROL_CLASS}
              onClick={() => setMapFullscreen((open) => !open)}
              aria-pressed={mapFullscreen}
              title={mapFullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
            >
              {mapFullscreen ? (
                <Minimize2 className="size-4" aria-hidden />
              ) : (
                <Maximize2 className="size-4" aria-hidden />
              )}
              {mapFullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
            </Button>
          </div>
        ) : null}
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
          {!mapFullscreen && isAdmin ? (
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
          {!mapFullscreen ? (
            !isCalibrated ? (
              <p className="text-sm text-[var(--color-muted)]">{t('uncalibratedHint')}</p>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">{t('selectHint')}</p>
            )
          ) : null}
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
