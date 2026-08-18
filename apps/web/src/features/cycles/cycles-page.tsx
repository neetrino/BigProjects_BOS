'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listCycles, updateCycle } from '@/lib/api/cycles';
import type { EventCycle, EventCycleStatus } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { useAuth } from '@/components/auth/auth-provider';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { SearchInput, SelectInput } from '@/components/ui/field';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';
import { showToast } from '@/components/ui/toast';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { ALL_STATUSES, canTransitionTo } from '@/features/cycles/constants';
import { CycleFormSheet } from '@/features/cycles/cycle-form-sheet';
import { CycleKanban } from '@/features/cycles/cycle-kanban';
import { CycleList } from '@/features/cycles/cycle-list';

const EMPTY_CYCLES: EventCycle[] = [];

type ConfirmAction = {
  cycle: EventCycle;
  nextStatus: Extract<EventCycleStatus, 'ACTIVE' | 'CLOSED'>;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cycles: EventCycle[] };

export function CyclesPage() {
  const t = useTranslations('cycles');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const { hydrateCycles } = useActiveCycle();

  const [loadState, setLoadState] = useClientCachedState<LoadState>(CLIENT_CACHE_KEYS.cycles, {
    status: 'loading',
  });
  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventCycleStatus | ''>('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<EventCycle | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    void listCycles()
      .then((cycles) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', cycles });
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
  }, [setLoadState, tCommon]);

  function replaceCycle(saved: EventCycle) {
    if (loadState.status !== 'ready') {
      return;
    }
    const index = loadState.cycles.findIndex((item) => item.id === saved.id);
    const cycles =
      index === -1
        ? [saved, ...loadState.cycles]
        : loadState.cycles.map((item, itemIndex) => (itemIndex === index ? saved : item));
    setLoadState({ status: 'ready', cycles });
    hydrateCycles(cycles);
  }

  function removeCycle(cycleId: string) {
    if (loadState.status !== 'ready') {
      return;
    }
    const cycles = loadState.cycles.filter((item) => item.id !== cycleId);
    setLoadState({ status: 'ready', cycles });
    hydrateCycles(cycles);
  }

  async function refreshCyclesFromServer() {
    const cycles = await listCycles();
    setLoadState({ status: 'ready', cycles });
    hydrateCycles(cycles);
  }

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(cycle: EventCycle) {
    if (!isAdmin) {
      return;
    }
    setEditing(cycle);
    setSheetOpen(true);
  }

  function openEditById(cycleId: string) {
    const cycle = allCycles.find((item) => item.id === cycleId);
    if (cycle) {
      openEdit(cycle);
    }
  }

  function requestStatus(
    cycle: EventCycle,
    nextStatus: Extract<EventCycleStatus, 'ACTIVE' | 'CLOSED'>,
  ) {
    if (!isAdmin || !canTransitionTo(cycle.status, nextStatus)) {
      return;
    }
    setConfirm({ cycle, nextStatus });
  }

  function handleBoardStatusChange(cycleId: string, nextStatus: EventCycleStatus) {
    const cycle = allCycles.find((item) => item.id === cycleId);
    if (!cycle || !canTransitionTo(cycle.status, nextStatus)) {
      return;
    }
    requestStatus(cycle, nextStatus);
  }

  async function handleConfirm() {
    if (!confirm) {
      return;
    }

    setConfirmBusy(true);
    try {
      await updateCycle(confirm.cycle.id, { status: confirm.nextStatus });
      await refreshCyclesFromServer();
      setConfirm(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  const allCycles = loadState.status === 'ready' ? loadState.cycles : EMPTY_CYCLES;

  const cycles = useMemo(() => {
    const query = search.toLowerCase();
    return allCycles.filter((cycle) => {
      if (statusFilter && cycle.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return cycle.name.toLowerCase().includes(query) || cycle.code.toLowerCase().includes(query);
    });
  }, [allCycles, search, statusFilter]);

  const hasAnyCycles = allCycles.length > 0;
  const hasFilteredCycles = cycles.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h1 className="page-heading">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </header>

      <div className="toolbar-shell shrink-0">
        <SearchInput
          className="toolbar-search"
          placeholder={t('searchPlaceholder')}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label={t('searchPlaceholder')}
        />
        <SelectInput
          fitContent
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as EventCycleStatus | '')}
          aria-label={t('statusFilter')}
        >
          <option value="">{t('allStatuses')}</option>
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`status.${status}`)}
            </option>
          ))}
        </SelectInput>
        <ViewModeSwitcher
          className="ml-auto shrink-0"
          value={view}
          onChange={setView}
          kanbanLabel={t('toolbar.kanban')}
          listLabel={t('toolbar.list')}
        />
        {isAdmin ? (
          <Button variant="primary" onClick={openCreate} className="shrink-0">
            <Plus className="size-4" aria-hidden />
            {t('create')}
          </Button>
        ) : null}
      </div>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && !hasAnyCycles ? (
        <EmptyState
          message={t('empty')}
          action={
            isAdmin ? (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" aria-hidden />
                {t('create')}
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {loadState.status === 'ready' && hasAnyCycles && !hasFilteredCycles ? (
        <EmptyState message={t('emptyFiltered')} />
      ) : null}

      {loadState.status === 'ready' && hasFilteredCycles && view === 'kanban' ? (
        <CycleKanban
          cycles={cycles}
          onOpen={openEditById}
          onStatusChange={handleBoardStatusChange}
        />
      ) : null}

      {loadState.status === 'ready' && hasFilteredCycles && view === 'list' ? (
        <CycleList
          cycles={cycles}
          isAdmin={isAdmin}
          onOpen={openEdit}
          onRequestStatus={requestStatus}
        />
      ) : null}

      {isAdmin ? (
        <CycleFormSheet
          open={sheetOpen}
          cycle={editing}
          onClose={() => setSheetOpen(false)}
          onSaved={replaceCycle}
          onDeleted={removeCycle}
        />
      ) : null}

      <Dialog
        open={confirm !== null}
        title={
          confirm?.nextStatus === 'ACTIVE' ? t('confirm.activateTitle') : t('confirm.closeTitle')
        }
        description={
          confirm?.nextStatus === 'ACTIVE'
            ? t('confirm.activateDescription', { name: confirm.cycle.name })
            : t('confirm.closeDescription', { name: confirm?.cycle.name ?? '' })
        }
        confirmLabel={tCommon('confirm')}
        cancelLabel={tCommon('cancel')}
        busy={confirmBusy}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
