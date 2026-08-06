'use client';

import { CalendarRange, Hash } from 'lucide-react';
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
        <p className="min-w-0 text-sm font-semibold tracking-tight text-[var(--color-fg)]">
          {cycle.name}
        </p>
        <StatusBadge label={t(`status.${cycle.status}`)} tone={statusTone(cycle.status)} />
      </div>

      <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[var(--color-bg)] px-2 py-1 text-xs font-medium text-[var(--color-muted)]">
        <Hash className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span className="truncate">{cycle.code}</span>
      </p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <CalendarRange className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span className="truncate">{dates}</span>
      </p>
    </KanbanCardShell>
  );
}
