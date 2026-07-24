'use client';

import { useTranslations } from 'next-intl';
import type { PartnerListItem } from '@/lib/api/types';
import { nameInitials } from '@/lib/format';
import { KanbanCardShell } from '@/components/kanban';
import { StatusBadge } from '@/components/ui/status-badge';
import { stageTone } from '@/features/partners/constants';

type PartnerCardProps = {
  partner: PartnerListItem;
  isDragging?: boolean;
};

export function PartnerCard({ partner, isDragging }: PartnerCardProps) {
  const t = useTranslations('partners');
  const hasAreas = partner.areasSummary.count > 0;

  return (
    <KanbanCardShell isDragging={isDragging}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold tracking-tight text-[var(--color-fg)]">
          {partner.organization.name}
        </p>
        <StatusBadge label={t(`stages.${partner.stage}`)} tone={stageTone(partner.stage)} />
      </div>

      {partner.partnerType ? (
        <span className="mt-1.5 inline-flex rounded-md bg-[var(--color-brass-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[#7a6239]">
          {partner.partnerType}
        </span>
      ) : null}

      {partner.primaryContact ? (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">{partner.primaryContact.name}</p>
      ) : (
        <p className="mt-1.5 text-xs text-[var(--color-muted)]/70">{t('card.noContact')}</p>
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
            className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[10px] font-semibold text-[var(--color-accent)]"
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
