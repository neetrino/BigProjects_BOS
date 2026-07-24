'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { CreateUserSheet } from '@/features/settings/create-user-sheet';
import { StaffAccountsBoard } from '@/features/settings/staff-accounts-board';
import { StaffAccountsList } from '@/features/settings/staff-accounts-list';
import type { BoardViewMode } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';
import { ApiError } from '@/lib/api/client';
import { listUsers, updateUser } from '@/lib/api/users';
import type { UserAccount } from '@/lib/api/types';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: UserAccount[] };

export function StaffAccountsSection() {
  const t = useTranslations('settings.staff');
  const tCommon = useTranslations('common');
  const { user: currentUser } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [view, setView] = useState<BoardViewMode>('kanban');
  const [createOpen, setCreateOpen] = useState(false);
  const [target, setTarget] = useState<UserAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void listUsers()
      .then((users) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', users });
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

  async function handleToggleStatus() {
    if (!target) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const nextStatus = target.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      const updated = await updateUser(target.id, { status: nextStatus });
      setLoadState((prev) => {
        if (prev.status !== 'ready') {
          return prev;
        }
        return {
          status: 'ready',
          users: prev.users.map((item) => (item.id === updated.id ? updated : item)),
        };
      });
      setTarget(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }

  const users = loadState.status === 'ready' ? loadState.users : [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]">
            {t('title')}
          </h2>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ViewModeSwitcher
            value={view}
            onChange={setView}
            boardIcon="grid"
            ariaLabel={t('toolbar.view')}
            kanbanLabel={t('toolbar.kanban')}
            listLabel={t('toolbar.list')}
          />
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            {t('create')}
          </Button>
        </div>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {actionError}
        </p>
      ) : null}

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && users.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : null}

      {loadState.status === 'ready' && users.length > 0 && view === 'kanban' ? (
        <StaffAccountsBoard
          users={users}
          currentUserId={currentUser.id}
          onToggleStatus={setTarget}
        />
      ) : null}

      {loadState.status === 'ready' && users.length > 0 && view === 'list' ? (
        <StaffAccountsList
          users={users}
          currentUserId={currentUser.id}
          onToggleStatus={setTarget}
        />
      ) : null}

      <CreateUserSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) =>
          setLoadState((prev) =>
            prev.status === 'ready' ? { status: 'ready', users: [created, ...prev.users] } : prev,
          )
        }
      />

      <Dialog
        open={target !== null}
        title={target?.status === 'ACTIVE' ? t('confirmDisableTitle') : t('confirmReactivateTitle')}
        description={
          target?.status === 'ACTIVE'
            ? t('confirmDisableDescription', { name: target.name })
            : t('confirmReactivateDescription', { name: target?.name ?? '' })
        }
        confirmLabel={tCommon('confirm')}
        cancelLabel={tCommon('cancel')}
        confirmVariant={target?.status === 'ACTIVE' ? 'danger' : 'primary'}
        busy={busy}
        onConfirm={() => void handleToggleStatus()}
        onCancel={() => setTarget(null)}
      />
    </section>
  );
}
