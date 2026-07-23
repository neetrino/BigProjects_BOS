'use client';

import { useTranslations } from 'next-intl';
import type { DealListItem } from '@/lib/api/types';
import { formatAmount, formatDate, formatSqm } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { stageTone } from '@/features/builder-crm/constants';

type DealListProps = {
  deals: DealListItem[];
  onOpen: (dealId: string) => void;
};

export function DealList({ deals, onOpen }: DealListProps) {
  const t = useTranslations('builderSales');

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-3 py-2 font-medium">{t('list.organization')}</th>
            <th className="px-3 py-2 font-medium">{t('list.contact')}</th>
            <th className="px-3 py-2 font-medium">{t('list.stage')}</th>
            <th className="px-3 py-2 font-medium">{t('list.expectedSqm')}</th>
            <th className="px-3 py-2 font-medium">{t('list.amount')}</th>
            <th className="px-3 py-2 font-medium">{t('list.staff')}</th>
            <th className="px-3 py-2 font-medium">{t('list.updated')}</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]"
              onClick={() => onOpen(deal.id)}
            >
              <td className="px-3 py-2.5 font-medium text-[var(--color-fg)]">
                {deal.organization.name}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {deal.primaryContact?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge label={t(`stages.${deal.stage}`)} tone={stageTone(deal.stage)} />
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {formatSqm(deal.expectedSqm) || '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {deal.agreedAmount != null && String(deal.agreedAmount).length > 0
                  ? formatAmount(deal.agreedAmount)
                  : '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {deal.assignedStaff?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {formatDate(deal.updatedAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
