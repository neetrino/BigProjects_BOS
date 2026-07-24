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
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent)]"
            >
              {nameInitials(account.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-[var(--color-fg)]">
                {account.name}
              </p>
              <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <Mail className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{account.email}</span>
              </p>
            </div>
          </div>
          <StatusBadge
            label={t(`status.${account.status}`)}
            tone={account.status === 'ACTIVE' ? 'active' : 'disabled'}
          />
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <Shield className="size-3.5 shrink-0 opacity-70" aria-hidden />
          {t(`roles.${account.role}`)}
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
