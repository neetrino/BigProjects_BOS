'use client';

import { useTranslations } from 'next-intl';
import type { ContactListItem } from '@/lib/api/types';

type ContactsListProps = {
  contacts: ContactListItem[];
  onOpenOrganization: (organizationId: string) => void;
};

export function ContactsList({ contacts, onOpenOrganization }: ContactsListProps) {
  const t = useTranslations('organizations');

  return (
    <div className="panel min-h-0 max-h-full overflow-auto">
      <table className="w-full min-w-[880px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[10rem]" />
          <col className="w-[12rem]" />
          <col />
          <col className="w-[7rem]" />
        </colgroup>
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-warm)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('contactsPage.columns.name')}</th>
            <th className="px-2 py-3 font-semibold tracking-wide">
              {t('contactsPage.columns.organization')}
            </th>
            <th className="px-2 py-3 font-semibold tracking-wide">
              {t('contactsPage.columns.position')}
            </th>
            <th className="px-2 py-3 font-semibold tracking-wide">{t('columns.phone')}</th>
            <th className="px-2 py-3 font-semibold tracking-wide">{t('columns.email')}</th>
            <th className="px-2 py-3 text-center font-semibold tracking-wide">
              {t('contactsPage.columns.primary')}
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-accent-soft)]/35"
              onClick={() => onOpenOrganization(item.organization.id)}
            >
              <td className="truncate px-4 py-3 font-medium text-[var(--color-fg)]">{item.name}</td>
              <td className="truncate px-2 py-3 text-[var(--color-muted)]">
                {item.organization.name}
              </td>
              <td className="truncate px-2 py-3 text-[var(--color-muted)]">
                {item.position || '—'}
              </td>
              <td className="truncate px-2 py-3 text-[var(--color-muted)]">{item.phone || '—'}</td>
              <td className="truncate px-2 py-3 text-[var(--color-muted)]">{item.email || '—'}</td>
              <td className="px-2 py-3 text-center text-[var(--color-muted)]">
                {item.isPrimary ? t('contacts.primary') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
