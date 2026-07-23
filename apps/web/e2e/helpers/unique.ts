/** Short unique suffix for smoke-test entity names (avoids collisions across runs). */
export function uniqueSuffix(): string {
  return Date.now().toString(36);
}
