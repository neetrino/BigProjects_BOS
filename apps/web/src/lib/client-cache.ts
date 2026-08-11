const store = new Map<string, unknown>();

export function getClientCache<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setClientCache<T>(key: string, value: T): void {
  store.set(key, value);
}

export const CLIENT_CACHE_KEYS = {
  cycles: 'cycles:list',
  organizations: 'organizations:list',
  contacts: 'contacts:list',
  staffUsers: 'staff:users',
  partners: (cycleId: string, search: string, staffId: string, type: string) =>
    `partners:${cycleId}|${search}|${staffId}|${type}`,
  deals: (cycleId: string, search: string, staffId: string) =>
    `deals:${cycleId}|${search}|${staffId}`,
  venuePlan: (cycleId: string) => `venue-plan:${cycleId}`,
} as const;
