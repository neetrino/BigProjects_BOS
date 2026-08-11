'use client';

import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PartnerListItem } from '@/lib/api/types';
import { nameInitials } from '@/lib/format';
import { KanbanCardShell } from '@/components/kanban';
import { StatusBadge } from '@/components/ui/status-badge';
import { stageTone } from '@/features/partners/constants';

type PartnerCardProps = {
  partner: PartnerListItem;
  isDragging?: boolean;
  enterIndex?: number;
};

export function PartnerCard({ partner, isDragging, enterIndex }: PartnerCardProps) {
  const t = useTranslations('partners');
  const hasAreas = partner.areasSummary.count > 0;

  return (
    <KanbanCardShell isDragging={isDragging} enterIndex={enterIndex}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-semibold tracking-tight text-[var(--color-fg)]">
          {partner.organization.name}
        </p>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge label={t(`stages.${partner.stage}`)} tone={stageTone(partner.stage)} />
          {partner.partnerType ? (
            <span className="inline-flex rounded-md bg-[var(--color-brass-soft)] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#7a6239]">
              {partner.partnerType}
            </span>
          ) : null}
        </div>
      </div>

      {partner.primaryContact ? (
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <User className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{partner.primaryContact.name}</span>
        </p>
      ) : (
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]/70">
          <User className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{t('card.noContact')}</span>
        </p>
      )}

      {hasAreas ? (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          {t('card.assignedAreas', {
            labels: partner.areasSummary.labels.join(', '),
          })}
        </p>
      ) : null}

      {partner.assignedStaff ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[10.5px] font-semibold text-[var(--color-accent)]"
          >
            {nameInitials(partner.assignedStaff.name)}
          </span>
          <span className="truncate text-xs text-[var(--color-muted)]">
            {partner.assignedStaff.name}
          </span>
        </div>
      ) : null}
    </KanbanCardShell>
  );
}
