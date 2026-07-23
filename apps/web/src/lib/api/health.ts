import { apiFetch } from './client';
import type { HealthResponse } from './types';

/**
 * Fetches NestJS health status via the same-origin API proxy.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/v1/health', {
    cache: 'no-store',
    redirectOn401: false,
  });
}
