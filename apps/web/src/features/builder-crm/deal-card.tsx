'use client';

import { MapPin, Ruler, User, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DealListItem } from '@/lib/api/types';
import { formatAmount, formatSqm, nameInitials } from '@/lib/format';
import { KanbanCardShell } from '@/components/kanban';
import { StatusBadge } from '@/components/ui/status-badge';
import { stageTone } from '@/features/builder-crm/constants';

type DealCardProps = {
  deal: DealListItem;
  isDragging?: boolean;
};

export function DealCard({ deal, isDragging }: DealCardProps) {
  const t = useTranslations('builderSales');
  const hasAreas = deal.areasSummary.count > 0;

  return (
    <KanbanCardShell isDragging={isDragging}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-semibold tracking-tight text-[var(--color-fg)]">
          {deal.organization.name}
        </p>
        <StatusBadge label={t(`stages.${deal.stage}`)} tone={stageTone(deal.stage)} />
      </div>

      {deal.primaryContact ? (
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <User className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{deal.primaryContact.name}</span>
        </p>
      ) : (
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]/70">
          <User className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{t('card.noContact')}</span>
        </p>
      )}

      {hasAreas ? (
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">
            {t('card.assignedAreas', {
              sqm: deal.areasSummary.totalSqm,
              labels: deal.areasSummary.labels.join(', '),
            })}
          </span>
        </p>
      ) : null}

      {deal.assignedStaff ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[11px] font-semibold text-[var(--color-accent)]"
          >
            {nameInitials(deal.assignedStaff.name)}
          </span>
          <span className="truncate text-xs text-[var(--color-muted)]">
            {deal.assignedStaff.name}
          </span>
        </div>
      ) : null}

      {(formatSqm(deal.expectedSqm) ||
        (deal.agreedAmount != null && String(deal.agreedAmount).length > 0)) && (
        <div className="mt-2.5 grid grid-cols-2 border-t border-[var(--color-border)] pt-2.5 text-xs text-[var(--color-muted)]">
          <div className="flex items-center justify-center gap-1.5 px-2">
            {formatSqm(deal.expectedSqm) ? (
              <>
                <Ruler className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">
                  {t('card.expectedSqm', { value: formatSqm(deal.expectedSqm) })}
                </span>
              </>
            ) : (
              <span aria-hidden>—</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 border-l border-[var(--color-border)] px-2">
            {deal.agreedAmount != null && String(deal.agreedAmount).length > 0 ? (
              <>
                <Wallet className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">
                  {t('card.amount', { value: formatAmount(deal.agreedAmount) })}
                </span>
              </>
            ) : (
              <span aria-hidden>—</span>
            )}
          </div>
        </div>
      )}
    </KanbanCardShell>
  );
}
