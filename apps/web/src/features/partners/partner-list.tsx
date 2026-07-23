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
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-3 py-2 font-medium">{t('list.organization')}</th>
            <th className="px-3 py-2 font-medium">{t('list.partnerType')}</th>
            <th className="px-3 py-2 font-medium">{t('list.contact')}</th>
            <th className="px-3 py-2 font-medium">{t('list.stage')}</th>
            <th className="px-3 py-2 font-medium">{t('list.staff')}</th>
            <th className="px-3 py-2 font-medium">{t('list.updated')}</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr
              key={partner.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]"
              onClick={() => onOpen(partner.id)}
            >
              <td className="px-3 py-2.5 font-medium text-[var(--color-fg)]">
                {partner.organization.name}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {partner.partnerType ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {partner.primaryContact?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge
                  label={t(`stages.${partner.stage}`)}
                  tone={stageTone(partner.stage)}
                />
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {partner.assignedStaff?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-muted)]">
                {formatDate(partner.updatedAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
