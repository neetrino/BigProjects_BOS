'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listCycles } from '@/lib/api/cycles';
import type { EventCycle } from '@/lib/api/types';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { useCycleQueryParam } from '@/hooks/use-cycle-query-param';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';

type CyclesLoad =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cycles: EventCycle[] };

type ActiveCycleContextValue = {
  cycles: EventCycle[];
  cycleId: string;
  setCycleId: (nextId: string) => void;
  status: CyclesLoad['status'];
  errorMessage: string | null;
  reloadCycles: () => void;
  hydrateCycles: (cycles: EventCycle[]) => void;
};

const ActiveCycleContext = createContext<ActiveCycleContextValue | null>(null);

type ActiveCycleProviderProps = {
  children: ReactNode;
};

export function ActiveCycleProvider({ children }: ActiveCycleProviderProps) {
  const tCommon = useTranslations('common');
  const [cyclesLoad, setCyclesLoad] = useClientCachedState<CyclesLoad>(CLIENT_CACHE_KEYS.cycles, {
    status: 'loading',
  });
  const [reloadToken, setReloadToken] = useState(0);

  const cyclesReady = cyclesLoad.status === 'ready' ? cyclesLoad.cycles : null;
  const { cycleId, setCycleId } = useCycleQueryParam(cyclesReady);

  useEffect(() => {
    let cancelled = false;
    void listCycles()
      .then((cycles) => {
        if (!cancelled) {
          setCyclesLoad({ status: 'ready', cycles });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCyclesLoad({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken, setCyclesLoad, tCommon]);

  const reloadCycles = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const hydrateCycles = useCallback(
    (cycles: EventCycle[]) => {
      setCyclesLoad({ status: 'ready', cycles });
    },
    [setCyclesLoad],
  );

  const value = useMemo<ActiveCycleContextValue>(() => {
    if (cyclesLoad.status === 'ready') {
      return {
        cycles: cyclesLoad.cycles,
        cycleId,
        setCycleId,
        status: 'ready',
        errorMessage: null,
        reloadCycles,
        hydrateCycles,
      };
    }
    if (cyclesLoad.status === 'error') {
      return {
        cycles: [],
        cycleId: '',
        setCycleId,
        status: 'error',
        errorMessage: cyclesLoad.message,
        reloadCycles,
        hydrateCycles,
      };
    }
    return {
      cycles: [],
      cycleId: '',
      setCycleId,
      status: 'loading',
      errorMessage: null,
      reloadCycles,
      hydrateCycles,
    };
  }, [cycleId, cyclesLoad, hydrateCycles, reloadCycles, setCycleId]);

  return <ActiveCycleContext.Provider value={value}>{children}</ActiveCycleContext.Provider>;
}

export function useActiveCycle(): ActiveCycleContextValue {
  const value = useContext(ActiveCycleContext);
  if (!value) {
    throw new Error('useActiveCycle must be used within ActiveCycleProvider');
  }
  return value;
}
