'use client';

import { Building2, Briefcase, Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ContactListItem } from '@/lib/api/types';
import { KanbanCardShell } from '@/components/kanban';
import { CardMetaRow } from '@/components/ui/card-meta-row';

type ContactCardProps = {
  contact: ContactListItem;
  enterIndex?: number;
};

export function ContactCard({ contact, enterIndex }: ContactCardProps) {
  const t = useTranslations('organizations');
  const phone = contact.phone?.trim() || null;
  const email = contact.email?.trim() || null;
  const position = contact.position?.trim() || null;

  return (
    <div className="h-full w-full [&>article]:flex [&>article]:h-full [&>article]:flex-col">
      <KanbanCardShell enterIndex={enterIndex}>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-sm font-semibold tracking-tight text-[var(--color-fg)]">
            {contact.name}
          </p>
          {contact.isPrimary ? (
            <span className="shrink-0 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[11.5px] font-semibold text-[var(--color-brand)]">
              {t('contacts.primary')}
            </span>
          ) : null}
        </div>
        <div className="mt-2.5 flex flex-col gap-2">
          <CardMetaRow icon={Building2} tone="brand">
            {contact.organization.name}
          </CardMetaRow>
          {position ? (
            <CardMetaRow icon={Briefcase} tone="brass">
              {position}
            </CardMetaRow>
          ) : null}
          {phone ? (
            <CardMetaRow icon={Phone} tone="success">
              {phone}
            </CardMetaRow>
          ) : null}
          {email ? (
            <CardMetaRow icon={Mail} tone="accent">
              {email}
            </CardMetaRow>
          ) : null}
        </div>
      </KanbanCardShell>
    </div>
  );
}
