'use client';

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { getClientCache, setClientCache } from '@/lib/client-cache';

/**
 * useState that hydrates from (and writes back to) a session memory cache,
 * so route remounts can show the last known data instead of a loading flash.
 * When the cache key changes without a hit, previous state is kept (SWR-style).
 */
export function useClientCachedState<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [cacheKey, setCacheKey] = useState(key);
  const [state, setState] = useState<T>(() => getClientCache<T>(key) ?? fallback);

  if (key !== cacheKey) {
    setCacheKey(key);
    const cached = getClientCache<T>(key);
    if (cached !== undefined) {
      setState(cached);
    }
  }

  const setCachedState = useCallback<Dispatch<SetStateAction<T>>>(
    (value) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (current: T) => T)(prev) : value;
        setClientCache(key, next);
        return next;
      });
    },
    [key],
  );

  return [state, setCachedState];
}
