'use client';

import { useTranslations } from 'next-intl';
import type { EventCycle } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { KanbanCardShell } from '@/components/kanban';
import { StatusBadge } from '@/components/ui/status-badge';
import { statusTone } from '@/features/cycles/constants';

type CycleCardProps = {
  cycle: EventCycle;
  isDragging?: boolean;
};

export function CycleCard({ cycle, isDragging }: CycleCardProps) {
  const t = useTranslations('cycles');
  const dates =
    [formatDate(cycle.startsAt), formatDate(cycle.endsAt)].filter(Boolean).join(' – ') || '—';

  return (
    <KanbanCardShell isDragging={isDragging}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold tracking-tight text-[var(--color-fg)]">{cycle.name}</p>
        <StatusBadge label={t(`status.${cycle.status}`)} tone={statusTone(cycle.status)} />
      </div>
      <p className="mt-1.5 text-xs font-medium text-[var(--color-muted)]">{cycle.code}</p>
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">{dates}</p>
    </KanbanCardShell>
  );
}
