'use client';

import { Mail, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UserAccount } from '@/lib/api/types';
import { nameInitials } from '@/lib/format';
import { KanbanCardShell } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

type StaffAccountCardProps = {
  account: UserAccount;
  isCurrentUser: boolean;
  onToggleStatus: (account: UserAccount) => void;
};

export function StaffAccountCard({
  account,
  isCurrentUser,
  onToggleStatus,
}: StaffAccountCardProps) {
  const t = useTranslations('settings.staff');

  return (
    <div className="h-full w-full [&>article]:flex [&>article]:h-full [&>article]:flex-col">
      <KanbanCardShell>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)]"
            >
              {nameInitials(account.name)}
            </span>
            <p className="min-w-0 break-words text-base font-semibold tracking-tight text-[var(--color-fg)]">
              {account.name}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <StatusBadge
              label={t(`status.${account.status}`)}
              tone={account.status === 'ACTIVE' ? 'active' : 'disabled'}
            />
            <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <Shield className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {t(`roles.${account.role}`)}
            </p>
          </div>
        </div>

        <p className="mt-2.5 flex items-start gap-1.5 text-sm text-[var(--color-muted)]">
          <Mail className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="min-w-0 break-all">{account.email}</span>
        </p>

        <div className="mt-auto flex justify-end pt-3">
          <Button
            variant="secondary"
            disabled={isCurrentUser}
            onClick={() => onToggleStatus(account)}
          >
            {account.status === 'ACTIVE' ? t('disable') : t('reactivate')}
          </Button>
        </div>
      </KanbanCardShell>
    </div>
  );
}
