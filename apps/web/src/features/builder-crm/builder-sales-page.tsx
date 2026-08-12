'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listDeals, updateDeal } from '@/lib/api/deals';
import { listUsers } from '@/lib/api/users';
import type { DealListItem, DealStage, UserAccount } from '@/lib/api/types';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { showToast } from '@/components/ui/toast';
import { BuilderSalesToolbar } from '@/features/builder-crm/builder-sales-toolbar';
import type { BoardViewMode } from '@/features/builder-crm/constants';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { DealCreateSheet } from '@/features/builder-crm/deal-create-sheet';
import { DealKanban } from '@/features/builder-crm/deal-kanban';
import { DealList } from '@/features/builder-crm/deal-list';
import { DealSheet } from '@/features/builder-crm/deal-sheet';

type DealsLoad =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; deals: DealListItem[] };

type StaffOption = { id: string; name: string };

function staffFromDeals(deals: DealListItem[]): StaffOption[] {
  const map = new Map<string, string>();
  for (const deal of deals) {
    if (deal.assignedStaff) {
      map.set(deal.assignedStaff.id, deal.assignedStaff.name);
    }
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function BuilderSalesPage() {
  const t = useTranslations('builderSales');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const { cycleId, cycles, status: cyclesStatus, errorMessage: cyclesError } = useActiveCycle();

  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [adminUsers, setAdminUsers] = useState<UserAccount[]>([]);
  const dealsCacheKey = cycleId
    ? CLIENT_CACHE_KEYS.deals(cycleId, search, assignedStaffId)
    : 'deals:idle';
  const [dealsLoad, setDealsLoad] = useClientCachedState<DealsLoad>(dealsCacheKey, {
    status: cycleId ? 'loading' : 'idle',
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    let cancelled = false;
    void listUsers()
      .then((users) => {
        if (!cancelled) {
          setAdminUsers(users.filter((item) => item.status === 'ACTIVE'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAdminUsers([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!cycleId) {
      return;
    }

    let cancelled = false;

    void listDeals({
      cycleId,
      search: search || undefined,
      assignedStaffId: assignedStaffId || undefined,
    })
      .then((deals) => {
        if (!cancelled) {
          setDealsLoad({ status: 'ready', deals });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDealsLoad({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cycleId, search, assignedStaffId, reloadToken, setDealsLoad, tCommon]);

  const deals = useMemo(() => (dealsLoad.status === 'ready' ? dealsLoad.deals : []), [dealsLoad]);

  const staffOptions = useMemo<StaffOption[]>(() => {
    if (isAdmin && adminUsers.length > 0) {
      return adminUsers
        .map((item) => ({ id: item.id, name: item.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return staffFromDeals(deals);
  }, [adminUsers, deals, isAdmin]);

  const replaceDeal = useCallback(
    (saved: DealListItem) => {
      setDealsLoad((prev) => {
        if (prev.status !== 'ready') {
          return prev;
        }
        const index = prev.deals.findIndex((item) => item.id === saved.id);
        if (index === -1) {
          return { status: 'ready', deals: [saved, ...prev.deals] };
        }
        const next = [...prev.deals];
        next[index] = saved;
        return { status: 'ready', deals: next };
      });
    },
    [setDealsLoad],
  );

  const removeDeal = useCallback(
    (dealId: string) => {
      setDealsLoad((prev) => {
        if (prev.status !== 'ready') {
          return prev;
        }
        return {
          status: 'ready',
          deals: prev.deals.filter((item) => item.id !== dealId),
        };
      });
      setSelectedDealId((current) => (current === dealId ? null : current));
    },
    [setDealsLoad],
  );

  async function handleStageChange(dealId: string, stage: DealStage) {
    const previous = deals.find((item) => item.id === dealId);
    if (!previous) {
      return;
    }

    replaceDeal({ ...previous, stage });
    try {
      const updated = await updateDeal(dealId, { stage });
      replaceDeal(updated);
    } catch (err) {
      replaceDeal(previous);
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <BuilderSalesToolbar
        view={view}
        onViewChange={setView}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        staffOptions={staffOptions}
        assignedStaffId={assignedStaffId}
        onAssignedStaffChange={setAssignedStaffId}
        onCreate={() => setCreateOpen(true)}
      />

      {cyclesStatus === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {cyclesStatus === 'error' && cyclesError ? <ErrorState message={cyclesError} /> : null}

      {cyclesStatus === 'ready' && cycles.length === 0 ? (
        <EmptyState message={t('emptyNoCycles')} />
      ) : null}

      {cyclesStatus === 'ready' && cycleId ? (
        <>
          {dealsLoad.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
          {dealsLoad.status === 'error' ? <ErrorState message={dealsLoad.message} /> : null}
          {dealsLoad.status === 'ready' && deals.length === 0 ? (
            <EmptyState
              message={t('empty')}
              action={
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  {t('create')}
                </Button>
              }
            />
          ) : null}
          {dealsLoad.status === 'ready' && deals.length > 0 && view === 'kanban' ? (
            <DealKanban
              deals={deals}
              onOpen={setSelectedDealId}
              onStageChange={handleStageChange}
            />
          ) : null}
          {dealsLoad.status === 'ready' && deals.length > 0 && view === 'list' ? (
            <DealList deals={deals} onOpen={setSelectedDealId} />
          ) : null}
        </>
      ) : null}

      <DealCreateSheet
        open={createOpen}
        eventCycleId={cycleId}
        staffOptions={staffOptions}
        onClose={() => setCreateOpen(false)}
        onCreated={(deal) => {
          replaceDeal(deal);
          setReloadToken((value) => value + 1);
          setSelectedDealId(deal.id);
        }}
      />

      <DealSheet
        open={selectedDealId !== null}
        dealId={selectedDealId}
        staffOptions={staffOptions}
        onClose={() => setSelectedDealId(null)}
        onUpdated={replaceDeal}
        onDeleted={removeDeal}
      />
    </div>
  );
}
