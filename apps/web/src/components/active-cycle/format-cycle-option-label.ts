import type { EventCycle } from '@/lib/api/types';

/** Shared option text for cycle selects (name + optional active marker). */
export function formatCycleOptionLabel(cycle: EventCycle, activeLabel: string): string {
  if (cycle.status !== 'ACTIVE') {
    return cycle.name;
  }
  return `${cycle.name} (${activeLabel})`;
}
