'use client';

import { Globe, Mail, Phone, Users, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OrganizationListItem } from '@/lib/api/types';
import { KanbanCardShell } from '@/components/kanban';

type OrganizationCardProps = {
  organization: OrganizationListItem;
};

function websiteHref(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

type InfoRowProps = {
  icon: LucideIcon;
  children: string;
  href?: string;
};

function InfoRow({ icon: Icon, children, href }: InfoRowProps) {
  const content = (
    <>
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span className="truncate">{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-[var(--color-accent)]"
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">{content}</p>
  );
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const t = useTranslations('organizations');
  const phone = organization.phone?.trim() || null;
  const email = organization.email?.trim() || null;
  const website = organization.website?.trim() || null;

  return (
    <div className="h-full w-full [&>article]:flex [&>article]:h-full [&>article]:flex-col">
      <KanbanCardShell>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold tracking-tight text-[var(--color-fg)]">
            {organization.name}
          </p>
          <span className="shrink-0 rounded-md bg-[var(--color-brass-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[#7a6239]">
            {t(`types.${organization.type}`)}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          <InfoRow icon={Users}>{t('card.contacts', { count: organization.contactCount })}</InfoRow>
          {phone ? <InfoRow icon={Phone}>{phone}</InfoRow> : null}
          {email ? <InfoRow icon={Mail}>{email}</InfoRow> : null}
          {website ? (
            <InfoRow icon={Globe} href={websiteHref(website)}>
              {website}
            </InfoRow>
          ) : null}
        </div>
      </KanbanCardShell>
    </div>
  );
}
