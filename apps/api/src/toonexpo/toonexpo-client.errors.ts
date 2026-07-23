/** Raised for any transport-level failure talking to ToonExpo (network, timeout, non-2xx, bad JSON). */
export class ToonExpoWireError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToonExpoWireError';
  }
}
