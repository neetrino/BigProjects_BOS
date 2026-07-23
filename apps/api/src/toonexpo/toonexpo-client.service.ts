import { Injectable } from '@nestjs/common';
import { ToonExpoWireError } from './toonexpo-client.errors';
import {
  ToonExpoProvisioningRequestWire,
  ToonExpoProvisioningResponseWire,
  VenueMapPublishRequestWire,
  VenueMapPublishResponseWire,
} from './types/toonexpo-wire.types';

const REQUEST_TIMEOUT_MS = 10_000;
const API_KEY_HEADER = 'x-bos-api-key';
const PROVISIONING_PATH = '/integrations/bos/provisioning';
const VENUE_MAP_PUBLISH_PATH = '/integrations/bos/venue-map/publish';

/**
 * Thin outbound HTTP client for ToonExpo's real wire contract. Every failure (network,
 * timeout, non-2xx, malformed body) is surfaced as a {@link ToonExpoWireError} so callers
 * can uniformly mark their local rows FAILED instead of throwing a 502 to our own clients.
 */
@Injectable()
export class ToonExpoClientService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = this.requireEnv('TOONEXPO_API_URL');
    this.apiKey = this.requireEnv('TOONEXPO_BOS_API_KEY');
  }

  async provisionCompany(
    payload: ToonExpoProvisioningRequestWire,
  ): Promise<ToonExpoProvisioningResponseWire> {
    return this.post<ToonExpoProvisioningResponseWire>(PROVISIONING_PATH, payload);
  }

  async publishVenueMap(
    payload: VenueMapPublishRequestWire,
  ): Promise<VenueMapPublishResponseWire> {
    return this.post<VenueMapPublishResponseWire>(VENUE_MAP_PUBLISH_PATH, payload);
  }

  private async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [API_KEY_HEADER]: this.apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return await this.parseResponse<TResponse>(response, path);
    } catch (error: unknown) {
      throw this.toWireError(error, path);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parseResponse<TResponse>(response: Response, path: string): Promise<TResponse> {
    const text = await response.text();
    if (!response.ok) {
      throw new ToonExpoWireError(
        `ToonExpo request to "${path}" failed with status ${response.status}: ${text}`,
      );
    }

    try {
      return JSON.parse(text) as TResponse;
    } catch {
      throw new ToonExpoWireError(`ToonExpo response from "${path}" was not valid JSON.`);
    }
  }

  private toWireError(error: unknown, path: string): ToonExpoWireError {
    if (error instanceof ToonExpoWireError) {
      return error;
    }
    const reason = error instanceof Error ? error.message : String(error);
    return new ToonExpoWireError(`ToonExpo request to "${path}" failed: ${reason}`);
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }
}
