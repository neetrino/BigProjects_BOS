export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  database: 'up' | 'down';
};

const DEFAULT_API_BASE_URL = 'http://localhost:4000';

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

/**
 * Fetches NestJS health status. This module is the only place that knows the API base URL.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/health`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}
