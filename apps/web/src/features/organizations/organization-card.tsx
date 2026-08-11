'use client';

import { Globe, Mail, Phone, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OrganizationListItem } from '@/lib/api/types';
import { KanbanCardShell } from '@/components/kanban';
import { CardMetaRow } from '@/components/ui/card-meta-row';

type OrganizationCardProps = {
  organization: OrganizationListItem;
  enterIndex?: number;
};

function websiteHref(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function OrganizationCard({ organization, enterIndex }: OrganizationCardProps) {
  const t = useTranslations('organizations');
  const phone = organization.phone?.trim() || null;
  const email = organization.email?.trim() || null;
  const website = organization.website?.trim() || null;

  return (
    <div className="h-full w-full [&>article]:flex [&>article]:h-full [&>article]:flex-col">
      <KanbanCardShell enterIndex={enterIndex}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold tracking-tight text-[var(--color-fg)]">
            {organization.name}
          </p>
          <span className="shrink-0 rounded-md bg-[var(--color-brass-soft)] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#7a6239]">
            {t(`types.${organization.type}`)}
          </span>
        </div>
        <div className="mt-2.5 flex flex-col gap-2">
          <CardMetaRow icon={Users} tone="brand">
            {t('card.contacts', { count: organization.contactCount })}
          </CardMetaRow>
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
          {website ? (
            <CardMetaRow
              icon={Globe}
              tone="brass"
              href={websiteHref(website)}
              onLinkClick={(event) => event.stopPropagation()}
            >
              {website}
            </CardMetaRow>
          ) : null}
        </div>
      </KanbanCardShell>
    </div>
  );
}
