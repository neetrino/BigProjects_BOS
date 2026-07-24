'use client';

import { useTranslations } from 'next-intl';
import type { PartnerListItem } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { stageTone } from '@/features/partners/constants';

type PartnerListProps = {
  partners: PartnerListItem[];
  onOpen: (partnerId: string) => void;
};

export function PartnerList({ partners, onOpen }: PartnerListProps) {
  const t = useTranslations('partners');

  return (
    <div className="panel min-h-0 max-h-full overflow-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-warm)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('list.organization')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('list.partnerType')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('list.contact')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.stage')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">{t('list.staff')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('list.updated')}
            </th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr
              key={partner.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-accent-soft)]/35"
              onClick={() => onOpen(partner.id)}
            >
              <td className="px-4 py-3 font-medium text-[var(--color-fg)]">
                {partner.organization.name}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {partner.partnerType ?? '—'}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {partner.primaryContact?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge label={t(`stages.${partner.stage}`)} tone={stageTone(partner.stage)} />
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {partner.assignedStaff?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {formatDate(partner.updatedAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
