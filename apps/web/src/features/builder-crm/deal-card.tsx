'use client';

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
        <p className="text-sm font-semibold text-[var(--color-fg)]">{deal.organization.name}</p>
        <StatusBadge label={t(`stages.${deal.stage}`)} tone={stageTone(deal.stage)} />
      </div>

      {deal.primaryContact ? (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">{deal.primaryContact.name}</p>
      ) : (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]/70">{t('card.noContact')}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
        {formatSqm(deal.expectedSqm) ? (
          <span>{t('card.expectedSqm', { value: formatSqm(deal.expectedSqm) })}</span>
        ) : null}
        {deal.agreedAmount != null && String(deal.agreedAmount).length > 0 ? (
          <span>{t('card.amount', { value: formatAmount(deal.agreedAmount) })}</span>
        ) : null}
      </div>

      {hasAreas ? (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          {t('card.assignedAreas', {
            sqm: deal.areasSummary.totalSqm,
            labels: deal.areasSummary.labels.join(', '),
          })}
        </p>
      ) : null}

      {deal.assignedStaff ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-bg)] text-[10px] font-semibold text-[var(--color-muted)]"
          >
            {nameInitials(deal.assignedStaff.name)}
          </span>
          <span className="truncate text-xs text-[var(--color-muted)]">
            {deal.assignedStaff.name}
          </span>
        </div>
      ) : null}
    </KanbanCardShell>
  );
}
