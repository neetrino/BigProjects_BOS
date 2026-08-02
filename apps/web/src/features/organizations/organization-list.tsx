'use client';

import { useTranslations } from 'next-intl';
import type { OrganizationListItem } from '@/lib/api/types';
type OrganizationListProps = {
  organizations: OrganizationListItem[];
  onOpen: (organizationId: string) => void;
};

export function OrganizationList({ organizations, onOpen }: OrganizationListProps) {
  const t = useTranslations('organizations');

  return (
    <div className="panel min-h-0 max-h-full overflow-auto">
      <table className="w-full min-w-[720px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[26%]" />
          <col className="w-[9rem]" />
          <col className="w-[8rem]" />
          <col className="w-[12rem]" />
          <col />
        </colgroup>
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-warm)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.name')}</th>
            <th className="px-2 py-3 text-center font-semibold tracking-wide">
              {t('columns.type')}
            </th>
            <th className="px-2 py-3 text-center font-semibold tracking-wide">
              {t('columns.contacts')}
            </th>
            <th className="pl-10 pr-2 py-3 font-semibold tracking-wide">{t('columns.phone')}</th>
            <th className="pl-10 pr-2 py-3 font-semibold tracking-wide">{t('columns.email')}</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-accent-soft)]/35"
              onClick={() => onOpen(item.id)}
            >
              <td className="truncate px-4 py-3 font-medium text-[var(--color-fg)]">{item.name}</td>
              <td className="px-2 py-3 text-center text-[var(--color-muted)]">
                {t(`types.${item.type}`)}
              </td>
              <td className="px-2 py-3 text-center text-[var(--color-muted)]">
                {item.contactCount}
              </td>
              <td className="truncate py-3 pl-10 pr-2 text-[var(--color-muted)]">
                {item.phone || '—'}
              </td>
              <td className="py-3 pl-10 pr-4 text-[var(--color-muted)]">{item.email || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
