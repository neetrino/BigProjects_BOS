'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listPartners, updatePartner } from '@/lib/api/partners';
import { listUsers } from '@/lib/api/users';
import type { PartnerListItem, PartnerStage, UserAccount } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { showToast } from '@/components/ui/toast';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { PartnerCreateSheet } from '@/features/partners/partner-create-sheet';
import { PartnerKanban } from '@/features/partners/partner-kanban';
import { PartnerList } from '@/features/partners/partner-list';
import { PartnerSheet } from '@/features/partners/partner-sheet';
import {
  mergePartnerTypes,
  staffFromPartners,
  type PartnersLoad,
  type StaffOption,
} from '@/features/partners/partners-helpers';
import { PartnersToolbar } from '@/features/partners/partners-toolbar';

export function PartnersPage() {
  const t = useTranslations('partners');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const { cycleId, cycles, status: cyclesStatus, errorMessage: cyclesError } = useActiveCycle();

  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [adminUsers, setAdminUsers] = useState<UserAccount[]>([]);
  const partnersCacheKey = cycleId
    ? CLIENT_CACHE_KEYS.partners(cycleId, search, assignedStaffId, partnerType)
    : 'partners:idle';
  const [partnersLoad, setPartnersLoad] = useClientCachedState<PartnersLoad>(partnersCacheKey, {
    status: cycleId ? 'loading' : 'idle',
  });
  const [knownPartnerTypes, setKnownPartnerTypes] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const previousCycleIdRef = useRef(cycleId);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (previousCycleIdRef.current === cycleId) {
      return;
    }
    previousCycleIdRef.current = cycleId;
    setKnownPartnerTypes([]);
    setPartnerType('');
  }, [cycleId]);

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

    void listPartners({
      cycleId,
      search: search || undefined,
      assignedStaffId: assignedStaffId || undefined,
      partnerType: partnerType || undefined,
    })
      .then((partners) => {
        if (!cancelled) {
          setPartnersLoad({ status: 'ready', partners });
          setKnownPartnerTypes((known) => mergePartnerTypes(known, partners));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPartnersLoad({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cycleId, search, assignedStaffId, partnerType, reloadToken, setPartnersLoad, tCommon]);

  const partners = useMemo(
    () => (partnersLoad.status === 'ready' ? partnersLoad.partners : []),
    [partnersLoad],
  );

  const partnerTypeOptions = useMemo(() => knownPartnerTypes, [knownPartnerTypes]);

  const staffOptions = useMemo<StaffOption[]>(() => {
    if (isAdmin && adminUsers.length > 0) {
      return adminUsers
        .map((item) => ({ id: item.id, name: item.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return staffFromPartners(partners);
  }, [adminUsers, isAdmin, partners]);

  const replacePartner = useCallback(
    (saved: PartnerListItem) => {
      setPartnersLoad((prev) => {
        if (prev.status !== 'ready') {
          return prev;
        }
        const index = prev.partners.findIndex((item) => item.id === saved.id);
        if (index === -1) {
          return { status: 'ready', partners: [saved, ...prev.partners] };
        }
        const next = [...prev.partners];
        next[index] = saved;
        return { status: 'ready', partners: next };
      });
      setKnownPartnerTypes((known) => mergePartnerTypes(known, [saved]));
    },
    [setPartnersLoad],
  );

  const removePartner = useCallback(
    (partnerId: string) => {
      setPartnersLoad((prev) => {
        if (prev.status !== 'ready') {
          return prev;
        }
        return {
          status: 'ready',
          partners: prev.partners.filter((item) => item.id !== partnerId),
        };
      });
      setSelectedPartnerId((current) => (current === partnerId ? null : current));
    },
    [setPartnersLoad],
  );

  async function handleStageChange(partnerId: string, stage: PartnerStage) {
    const previous = partners.find((item) => item.id === partnerId);
    if (!previous) {
      return;
    }

    replacePartner({ ...previous, stage });
    try {
      const updated = await updatePartner(partnerId, { stage });
      replacePartner(updated);
    } catch (err) {
      replacePartner(previous);
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PartnersToolbar
        view={view}
        onViewChange={setView}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        partnerTypeOptions={partnerTypeOptions}
        partnerType={partnerType}
        onPartnerTypeChange={setPartnerType}
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
          {partnersLoad.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
          {partnersLoad.status === 'error' ? <ErrorState message={partnersLoad.message} /> : null}
          {partnersLoad.status === 'ready' && partners.length === 0 ? (
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
          {partnersLoad.status === 'ready' && partners.length > 0 && view === 'kanban' ? (
            <PartnerKanban
              partners={partners}
              onOpen={setSelectedPartnerId}
              onStageChange={handleStageChange}
            />
          ) : null}
          {partnersLoad.status === 'ready' && partners.length > 0 && view === 'list' ? (
            <PartnerList partners={partners} onOpen={setSelectedPartnerId} />
          ) : null}
        </>
      ) : null}

      <PartnerCreateSheet
        open={createOpen}
        eventCycleId={cycleId}
        staffOptions={staffOptions}
        onClose={() => setCreateOpen(false)}
        onCreated={(partner) => {
          replacePartner(partner);
          setReloadToken((value) => value + 1);
          setSelectedPartnerId(partner.id);
        }}
      />

      <PartnerSheet
        open={selectedPartnerId !== null}
        partnerId={selectedPartnerId}
        staffOptions={staffOptions}
        onClose={() => setSelectedPartnerId(null)}
        onUpdated={replacePartner}
        onDeleted={removePartner}
      />
    </div>
  );
}
