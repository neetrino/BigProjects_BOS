'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listCycles, updateCycle } from '@/lib/api/cycles';
import type { EventCycle, EventCycleStatus } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { CycleFormSheet } from '@/features/cycles/cycle-form-sheet';

type ConfirmAction = {
  cycle: EventCycle;
  nextStatus: Extract<EventCycleStatus, 'ACTIVE' | 'CLOSED'>;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cycles: EventCycle[] };

function statusTone(status: EventCycleStatus): 'draft' | 'active' | 'closed' {
  if (status === 'ACTIVE') {
    return 'active';
  }
  if (status === 'CLOSED') {
    return 'closed';
  }
  return 'draft';
}

export function CyclesPage() {
  const t = useTranslations('cycles');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<EventCycle | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

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
  }, [tCommon]);

  function replaceCycle(saved: EventCycle) {
    setLoadState((prev) => {
      if (prev.status !== 'ready') {
        return prev;
      }
      const index = prev.cycles.findIndex((item) => item.id === saved.id);
      if (index === -1) {
        return { status: 'ready', cycles: [saved, ...prev.cycles] };
      }
      const cycles = [...prev.cycles];
      cycles[index] = saved;
      return { status: 'ready', cycles };
    });
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

  async function handleConfirm() {
    if (!confirm) {
      return;
    }

    setConfirmBusy(true);
    try {
      const updated = await updateCycle(confirm.cycle.id, { status: confirm.nextStatus });
      replaceCycle(updated);
      setConfirm(null);
    } catch (err) {
      setLoadState({
        status: 'error',
        message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
      });
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  const cycles = loadState.status === 'ready' ? loadState.cycles : [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        {isAdmin ? (
          <Button variant="primary" onClick={openCreate}>
            {t('create')}
          </Button>
        ) : null}
      </header>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && cycles.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : null}

      {loadState.status === 'ready' && cycles.length > 0 ? (
        <div className="overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.code')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.status')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.dates')}</th>
                {isAdmin ? <th className="px-3 py-2 font-medium">{t('columns.actions')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className={
                    isAdmin
                      ? 'cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]'
                      : 'border-b border-[var(--color-border)] last:border-0'
                  }
                  onClick={() => openEdit(cycle)}
                >
                  <td className="px-3 py-2.5 font-medium text-[var(--color-fg)]">{cycle.name}</td>
                  <td className="px-3 py-2.5 text-[var(--color-muted)]">{cycle.code}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      label={t(`status.${cycle.status}`)}
                      tone={statusTone(cycle.status)}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-[var(--color-muted)]">
                    {[formatDate(cycle.startsAt), formatDate(cycle.endsAt)]
                      .filter(Boolean)
                      .join(' – ') || '—'}
                  </td>
                  {isAdmin ? (
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                        {cycle.status === 'DRAFT' ? (
                          <Button
                            variant="secondary"
                            onClick={() => setConfirm({ cycle, nextStatus: 'ACTIVE' })}
                          >
                            {t('actions.activate')}
                          </Button>
                        ) : null}
                        {cycle.status === 'ACTIVE' ? (
                          <Button
                            variant="secondary"
                            onClick={() => setConfirm({ cycle, nextStatus: 'CLOSED' })}
                          >
                            {t('actions.close')}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {isAdmin ? (
        <CycleFormSheet
          open={sheetOpen}
          cycle={editing}
          onClose={() => setSheetOpen(false)}
          onSaved={replaceCycle}
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
