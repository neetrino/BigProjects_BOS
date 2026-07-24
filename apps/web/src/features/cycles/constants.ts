'use client';

import type { EventCycleStatus } from '@/lib/api/types';
import type { KanbanColumnTone } from '@/components/kanban';

export const WORKFLOW_STATUSES: EventCycleStatus[] = ['DRAFT', 'ACTIVE'];
export const TERMINAL_STATUSES: EventCycleStatus[] = ['CLOSED'];
export const ALL_STATUSES: EventCycleStatus[] = ['DRAFT', 'ACTIVE', 'CLOSED'];

export function statusTone(status: EventCycleStatus): 'draft' | 'active' | 'closed' {
  if (status === 'ACTIVE') {
    return 'active';
  }
  if (status === 'CLOSED') {
    return 'closed';
  }
  return 'draft';
}

export function terminalColumnTone(status: EventCycleStatus): KanbanColumnTone {
  return status === 'CLOSED' ? 'negative' : 'default';
}

/** Allowed UI transitions (matches API). */
export function canTransitionTo(
  from: EventCycleStatus,
  to: EventCycleStatus,
): to is Extract<EventCycleStatus, 'ACTIVE' | 'CLOSED'> {
  if (from === 'DRAFT' && to === 'ACTIVE') {
    return true;
  }
  if (from === 'ACTIVE' && to === 'CLOSED') {
    return true;
  }
  return false;
}
