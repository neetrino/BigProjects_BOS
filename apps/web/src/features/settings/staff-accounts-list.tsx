'use client';

import { useTranslations } from 'next-intl';
import type { UserAccount } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

type StaffAccountsListProps = {
  users: UserAccount[];
  currentUserId: string;
  onToggleStatus: (account: UserAccount) => void;
};

export function StaffAccountsList({
  users,
  currentUserId,
  onToggleStatus,
}: StaffAccountsListProps) {
  const t = useTranslations('settings.staff');

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-warm)]/70 text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.name')}</th>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.email')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('columns.role')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('columns.status')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('columns.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((account) => (
            <tr key={account.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-3 py-2.5 font-medium">{account.name}</td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">{account.email}</td>
              <td className="px-3 py-2.5 text-center text-[var(--color-muted)]">
                {t(`roles.${account.role}`)}
              </td>
              <td className="px-3 py-2.5 text-center">
                <StatusBadge
                  label={t(`status.${account.status}`)}
                  tone={account.status === 'ACTIVE' ? 'active' : 'disabled'}
                />
              </td>
              <td className="px-3 py-2.5 text-center">
                <Button
                  variant="secondary"
                  disabled={account.id === currentUserId}
                  onClick={() => onToggleStatus(account)}
                >
                  {account.status === 'ACTIVE' ? t('disable') : t('reactivate')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
