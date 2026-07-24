'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { CreateUserSheet } from '@/features/settings/create-user-sheet';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { StatusBadge } from '@/components/ui/status-badge';
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
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
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
      {loadState.status === 'ready' && users.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : null}

      {loadState.status === 'ready' && users.length > 0 ? (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-warm)]/70 text-xs text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.name')}</th>
                <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.email')}</th>
                <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.role')}</th>
                <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.status')}</th>
                <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-3 py-2.5 font-medium">{account.name}</td>
                  <td className="px-3 py-2.5 text-[var(--color-muted)]">{account.email}</td>
                  <td className="px-3 py-2.5 text-[var(--color-muted)]">
                    {t(`roles.${account.role}`)}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      label={t(`status.${account.status}`)}
                      tone={account.status === 'ACTIVE' ? 'active' : 'disabled'}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Button
                      variant="secondary"
                      disabled={account.id === currentUser.id}
                      onClick={() => setTarget(account)}
                    >
                      {account.status === 'ACTIVE' ? t('disable') : t('reactivate')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
