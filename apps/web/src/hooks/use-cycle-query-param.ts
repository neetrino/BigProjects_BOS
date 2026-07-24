'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const writeCycleToUrl = useCallback(
    (nextId: string) => {
      if (!nextId || cycleFromUrl === nextId) {
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set('cycle', nextId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [cycleFromUrl, pathname, router, searchParams],
  );

  const [optimisticCycleId, setOptimisticCycleId] = useState<string | null>(null);
  const [prevCycleFromUrl, setPrevCycleFromUrl] = useState(cycleFromUrl);

  if (cycleFromUrl !== prevCycleFromUrl) {
    setPrevCycleFromUrl(cycleFromUrl);
    setOptimisticCycleId(null);
  }

  const cycleId =
    cycles && cycles.length > 0
      ? optimisticCycleId && cycles.some((cycle) => cycle.id === optimisticCycleId)
        ? optimisticCycleId
        : pickDefaultCycleId(cycles, cycleFromUrl)
      : '';

  useEffect(() => {
    if (!cycleId) {
      return;
    }
    writeCycleToUrl(cycleId);
  }, [cycleId, writeCycleToUrl]);

  const setCycleId = useCallback(
    (nextId: string) => {
      setOptimisticCycleId(nextId);
      writeCycleToUrl(nextId);
    },
    [writeCycleToUrl],
  );

  return { cycleId, setCycleId };
}
