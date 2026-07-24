'use client';

import { useTranslations } from 'next-intl';
import type { EventCycle, EventCycleStatus } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { statusTone } from '@/features/cycles/constants';

type CycleListProps = {
  cycles: EventCycle[];
  isAdmin: boolean;
  onOpen: (cycle: EventCycle) => void;
  onRequestStatus: (
    cycle: EventCycle,
    nextStatus: Extract<EventCycleStatus, 'ACTIVE' | 'CLOSED'>,
  ) => void;
};

export function CycleList({ cycles, isAdmin, onOpen, onRequestStatus }: CycleListProps) {
  const t = useTranslations('cycles');

  return (
    <div className="panel min-h-0 max-h-full overflow-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-warm)] text-xs text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.name')}</th>
            <th className="px-4 py-3 font-semibold tracking-wide">{t('columns.code')}</th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('columns.status')}
            </th>
            <th className="px-4 py-3 text-center font-semibold tracking-wide">
              {t('columns.dates')}
            </th>
            {isAdmin ? (
              <th className="px-4 py-3 text-center font-semibold tracking-wide">
                {t('columns.actions')}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {cycles.map((cycle) => (
            <tr
              key={cycle.id}
              className={
                isAdmin
                  ? 'cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-accent-soft)]/35'
                  : 'border-b border-[var(--color-border)] last:border-0'
              }
              onClick={() => onOpen(cycle)}
            >
              <td className="px-4 py-3 font-medium text-[var(--color-fg)]">{cycle.name}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{cycle.code}</td>
              <td className="px-4 py-3 text-center">
                <StatusBadge label={t(`status.${cycle.status}`)} tone={statusTone(cycle.status)} />
              </td>
              <td className="px-4 py-3 text-center text-[var(--color-muted)]">
                {[formatDate(cycle.startsAt), formatDate(cycle.endsAt)]
                  .filter(Boolean)
                  .join(' – ') || '—'}
              </td>
              {isAdmin ? (
                <td className="px-4 py-3">
                  <div
                    className="flex justify-center gap-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {cycle.status === 'DRAFT' ? (
                      <Button variant="secondary" onClick={() => onRequestStatus(cycle, 'ACTIVE')}>
                        {t('actions.activate')}
                      </Button>
                    ) : null}
                    {cycle.status === 'ACTIVE' ? (
                      <Button variant="secondary" onClick={() => onRequestStatus(cycle, 'CLOSED')}>
                        {t('actions.close')}
                      </Button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
