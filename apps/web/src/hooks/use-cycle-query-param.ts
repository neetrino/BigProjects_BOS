'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { EventCycle } from '@/lib/api/types';

function pickDefaultCycleId(cycles: EventCycle[], requested: string | null): string {
  if (requested && cycles.some((cycle) => cycle.id === requested)) {
    return requested;
  }
  const active = cycles.find((cycle) => cycle.status === 'ACTIVE');
  return active?.id ?? cycles[0]?.id ?? '';
}

/**
 * Bidirectional `?cycle=` sync: seeds from URL (or ACTIVE), follows back/forward,
 * and writes the URL only when the selected cycle differs (no useless remount).
 */
export function useCycleQueryParam(cycles: EventCycle[] | null): {
  cycleId: string;
  setCycleId: (nextId: string) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cycleFromUrl = searchParams.get('cycle');
  const [cycleId, setCycleIdState] = useState('');
  const seededRef = useRef(false);
  const skipUrlFollowRef = useRef(false);

  const writeCycleToUrl = useCallback(
    (nextId: string) => {
      if (!nextId || cycleFromUrl === nextId) {
        return;
      }
      skipUrlFollowRef.current = true;
      const params = new URLSearchParams(searchParams.toString());
      params.set('cycle', nextId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [cycleFromUrl, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!cycles || cycles.length === 0) {
      return;
    }

    if (!seededRef.current) {
      seededRef.current = true;
      const initial = pickDefaultCycleId(cycles, cycleFromUrl);
      setCycleIdState(initial);
      writeCycleToUrl(initial);
      return;
    }

    if (skipUrlFollowRef.current) {
      skipUrlFollowRef.current = false;
      return;
    }

    if (
      cycleFromUrl &&
      cycles.some((cycle) => cycle.id === cycleFromUrl) &&
      cycleFromUrl !== cycleId
    ) {
      setCycleIdState(cycleFromUrl);
    }
  }, [cycleFromUrl, cycleId, cycles, writeCycleToUrl]);

  const setCycleId = useCallback(
    (nextId: string) => {
      setCycleIdState(nextId);
      writeCycleToUrl(nextId);
    },
    [writeCycleToUrl],
  );

  return { cycleId, setCycleId };
}
