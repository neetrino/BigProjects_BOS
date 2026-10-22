'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { getVenuePlan, type VenuePlan } from '@/lib/api/venue-map';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';
import { CalibrationControls } from './calibration-controls';
import { CreateAreaDialog } from './create-area-dialog';
import { CreatePlanForm } from './create-plan-form';
import type { GridCell, ImagePoint } from './domain/grid-transform';
import type { EditorInteractionMode } from './venue-map-stage';
import { VenueMapPublicationSection } from '@/features/toonexpo/venue-map-publication-section';
import {
  persistMapBooth,
  persistMapBoothLayout,
  persistMapBoothMove,
  persistMissingMapBooths,
} from './persist-map-booth';
import { showToast } from '@/components/ui/toast';
import { ToonExpoVenueMapFrame } from './toonexpo-venue-map-frame';
import type { MapBoothPick } from './toonexpo-venue-map-bridge';
import { VenueMapPanel } from './venue-map-panel';
import { VenueMapToolbar } from './venue-map-toolbar';

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
  const [selectedBooth, setSelectedBooth] = useState<MapBoothPick | null>(null);
  const [mapBooths, setMapBooths] = useState<MapBoothPick[]>([]);
  const [interactionMode, setInteractionMode] = useState<EditorInteractionMode>('pan');
  const [calibrationPoints, setCalibrationPoints] = useState<ImagePoint[]>([]);
  const [pendingSelection, setPendingSelection] = useState<GridCell[]>([]);
  const [fitRequestId, setFitRequestId] = useState(0);
  const [focusRequestId, setFocusRequestId] = useState(0);
  const [clearDirtyRequestId, setClearDirtyRequestId] = useState(0);
  const [saveLayoutBusy, setSaveLayoutBusy] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [editorCycleId, setEditorCycleId] = useState(cycleId);

  if (cycleId !== editorCycleId) {
    setEditorCycleId(cycleId);
    setSelectedAreaId(null);
    setSelectedBooth(null);
    setMapBooths([]);
    setPendingSelection([]);
    setCalibrationPoints([]);
    setInteractionMode('pan');
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
  const mapSelectionId = selectedAreaId ?? selectedBooth?.id ?? null;

  const persistingBoothIdRef = useRef<string | null>(null);
  const importedPlanIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!plan || plan.pixelsPerMeter === null || mapBooths.length === 0) {
      return;
    }
    if (importedPlanIdRef.current === plan.id) {
      return;
    }
    importedPlanIdRef.current = plan.id;
    let cancelled = false;
    void persistMissingMapBooths(plan.id, mapBooths, plan.areas)
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.created > 0 || result.updated > 0) {
          if (result.created > 0) {
            showToast(t('toolbar.boothsImported', { count: result.created }), 'success');
          }
          refreshPlan();
        }
        if (result.failed > 0) {
          showToast(t('toolbar.boothsImportFailed', { count: result.failed }), 'error');
        }
      })
      .catch((err: unknown) => {
        importedPlanIdRef.current = null;
        if (!cancelled) {
          showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mapBooths, plan, refreshPlan, t, tCommon]);

  const handleSelectArea = useCallback((areaId: string | null) => {
    setSelectedAreaId(areaId);
    setSelectedBooth(null);
    if (areaId) {
      setFocusRequestId((id) => id + 1);
    }
  }, []);

  const handleSelectBooth = useCallback(
    (booth: MapBoothPick | null) => {
      if (!booth) {
        setSelectedAreaId(null);
        setSelectedBooth(null);
        return;
      }
      setSelectedBooth(booth);
      setFocusRequestId((id) => id + 1);
      const existing = plan?.areas.find(
        (area) => area.id === booth.areaId || area.code === booth.code,
      );
      if (existing) {
        setSelectedAreaId(existing.id);
        return;
      }
      setSelectedAreaId(null);
      if (!plan || booth.cells.length === 0) {
        return;
      }
      if (persistingBoothIdRef.current === booth.id) {
        return;
      }
      persistingBoothIdRef.current = booth.id;
      void persistMapBooth(plan.id, booth, plan.areas)
        .then((areaId) => {
          if (!areaId) {
            return;
          }
          setSelectedAreaId(areaId);
          refreshPlan();
        })
        .catch(() => {
          setSelectedAreaId(null);
        })
        .finally(() => {
          if (persistingBoothIdRef.current === booth.id) {
            persistingBoothIdRef.current = null;
          }
        });
    },
    [plan, refreshPlan],
  );

  const handleBoothMoved = useCallback(
    (booth: MapBoothPick) => {
      setSelectedBooth(booth);
      setMapBooths((prev) => prev.map((item) => (item.id === booth.id ? booth : item)));
      const existing = plan?.areas.find(
        (area) => area.id === booth.areaId || area.code === booth.code,
      );
      if (existing) {
        setSelectedAreaId(existing.id);
      }
      if (!plan || booth.cells.length === 0) {
        return;
      }
      void persistMapBoothMove(plan.id, booth, plan.areas)
        .then((areaId) => {
          if (areaId) {
            setSelectedAreaId(areaId);
          }
        })
        .catch((err: unknown) => {
          showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
        });
    },
    [plan, tCommon],
  );

  const layoutDirty = mapBooths.some((booth) => booth.dirty) || Boolean(selectedBooth?.dirty);

  const handleSaveLayout = useCallback(() => {
    if (!plan) {
      return;
    }
    const pending = mapBooths.some((booth) => booth.dirty)
      ? mapBooths
      : selectedBooth?.dirty
        ? [selectedBooth]
        : selectedBooth
          ? [{ ...selectedBooth, dirty: true }]
          : [];
    if (pending.length === 0) {
      showToast(t('toolbar.saveLayoutEmpty'), 'error');
      return;
    }
    setSaveLayoutBusy(true);
    void persistMapBoothLayout(plan.id, pending, plan.areas)
      .then((saved) => {
        showToast(t('toolbar.saveLayoutSaved', { count: saved }), 'success');
        setMapBooths((prev) => prev.map((booth) => ({ ...booth, dirty: false })));
        setSelectedBooth((prev) => (prev ? { ...prev, dirty: false } : prev));
        setClearDirtyRequestId((id) => id + 1);
        refreshPlan();
      })
      .catch((err: unknown) => {
        showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
      })
      .finally(() => {
        setSaveLayoutBusy(false);
      });
  }, [mapBooths, plan, refreshPlan, selectedBooth, t, tCommon]);
  const hasImage = Boolean(plan?.imageUrl && plan.imageWidth && plan.imageHeight);
  const toolbar = plan ? (
    <VenueMapToolbar
      isAdmin={isAdmin}
      interactionMode={interactionMode}
      mapFullscreen={mapFullscreen}
      onInteractionModeChange={setInteractionMode}
      onFit={() => setFitRequestId((id) => id + 1)}
      onSaveLayout={handleSaveLayout}
      saveLayoutBusy={saveLayoutBusy}
      layoutDirty={layoutDirty}
      onToggleFullscreen={() => {
        setMapFullscreen((open) => {
          if (!open) {
            setInteractionMode('pan');
          }
          return !open;
        });
      }}
    />
  ) : null;

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
      <header
        className={clsx(
          'mb-1',
          mapFullscreen && Boolean(plan) && 'flex flex-wrap items-center justify-between gap-3',
        )}
      >
        <div className="min-w-0">
          <h1 className="page-heading">{t('title')}</h1>
        </div>
        {mapFullscreen ? toolbar : null}
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

      {cycleId && plan ? (
        <>
          {!mapFullscreen && isAdmin ? (
            <VenueMapPublicationSection planId={plan.id} onPublished={refreshPlan} />
          ) : null}
          {isAdmin && interactionMode === 'calibrate' && hasImage ? (
            <CalibrationControls
              plan={plan}
              points={calibrationPoints}
              onClearPoints={() => setCalibrationPoints([])}
              onSaved={refreshPlan}
            />
          ) : null}
          {!mapFullscreen ? toolbar : null}
          <div className="panel flex min-h-0 flex-1 overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1">
              <ToonExpoVenueMapFrame
                fitRequestId={fitRequestId}
                clearDirtyRequestId={clearDirtyRequestId}
                title={t('title')}
                interactionMode={interactionMode}
                areas={plan.areas}
                selectedAreaId={mapSelectionId}
                focusRequestId={focusRequestId}
                onSelectBooth={handleSelectBooth}
                onBoothMoved={handleBoothMoved}
                onCatalog={setMapBooths}
                onSelectionComplete={setPendingSelection}
              />
            </div>
            <VenueMapPanel
              area={selectedArea}
              booth={selectedBooth}
              cycleId={cycleId}
              areas={plan.areas}
              mapBooths={mapBooths}
              selectedAreaId={selectedAreaId}
              selectedBoothId={selectedBooth?.id ?? selectedArea?.code ?? null}
              onSelectArea={handleSelectArea}
              onSelectBooth={handleSelectBooth}
              onSavePosition={handleSaveLayout}
              savePositionBusy={saveLayoutBusy}
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
