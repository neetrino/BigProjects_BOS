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
import { SearchInput, SelectInput } from '@/components/ui/field';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';
import { ApiError } from '@/lib/api/client';
import { listUsers, updateUser } from '@/lib/api/users';
import type { UserAccount, UserRole } from '@/lib/api/types';

const SEARCH_DEBOUNCE_MS = 300;
const STAFF_ROLES: UserRole[] = ['ADMIN', 'STAFF'];

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: UserAccount[] };

function matchesStaffSearch(user: UserAccount, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = `${user.name} ${user.email}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesStaffRole(user: UserAccount, role: UserRole | ''): boolean {
  return !role || user.role === role;
}

export function StaffAccountsSection() {
  const t = useTranslations('settings.staff');
  const tCommon = useTranslations('common');
  const { user: currentUser } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [target, setTarget] = useState<UserAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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
  const filteredUsers = users.filter(
    (user) => matchesStaffSearch(user, search) && matchesStaffRole(user, roleFilter),
  );

  return (
    <section className="flex flex-col gap-3">
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
          className="ml-auto shrink-0"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRole | '')}
          aria-label={t('roleFilter')}
        >
          <option value="">{t('allRoles')}</option>
          {STAFF_ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </SelectInput>
        <ViewModeSwitcher
          className="shrink-0"
          value={view}
          onChange={setView}
          boardIcon="grid"
          ariaLabel={t('toolbar.view')}
          kanbanLabel={t('toolbar.kanban')}
          listLabel={t('toolbar.list')}
        />
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Button>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {actionError}
        </p>
      ) : null}

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && filteredUsers.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : null}

      {loadState.status === 'ready' && filteredUsers.length > 0 && view === 'kanban' ? (
        <StaffAccountsBoard
          users={filteredUsers}
          currentUserId={currentUser.id}
          onToggleStatus={setTarget}
        />
      ) : null}

      {loadState.status === 'ready' && filteredUsers.length > 0 && view === 'list' ? (
        <StaffAccountsList
          users={filteredUsers}
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
