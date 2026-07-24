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
    <div className="panel min-h-0 max-h-full overflow-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-warm)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('list.organization')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.contact')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.stage')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('list.expectedSqm')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.amount')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.staff')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.updated')}</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-accent-soft)]/35"
              onClick={() => onOpen(deal.id)}
            >
              <td className="px-4 py-3 font-medium text-[var(--color-fg)]">
                {deal.organization.name}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {deal.primaryContact?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge label={t(`stages.${deal.stage}`)} tone={stageTone(deal.stage)} />
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {formatSqm(deal.expectedSqm) || '—'}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {deal.agreedAmount != null && String(deal.agreedAmount).length > 0
                  ? formatAmount(deal.agreedAmount)
                  : '—'}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {deal.assignedStaff?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {formatDate(deal.updatedAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
