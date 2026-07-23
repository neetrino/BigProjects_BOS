import { createHash } from 'node:crypto';

/**
 * Recursively sorts object keys so that structurally-identical content always serializes to
 * the same JSON string, regardless of property insertion order. Arrays keep their given
 * order — callers must fetch areas/cells in a deterministic DB order beforehand.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = canonicalize(source[key]);
    }
    return sorted;
  }

  return value;
}

/** SHA-256 hex digest of the canonical (stable key order) JSON representation of `content`. */
export function computeContentChecksum(content: unknown): string {
  const canonicalJson = JSON.stringify(canonicalize(content));
  return createHash('sha256').update(canonicalJson).digest('hex');
}
