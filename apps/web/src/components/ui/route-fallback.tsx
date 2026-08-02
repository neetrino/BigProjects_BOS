/** Quiet Suspense fallback — avoids a full-page "Loading…" flash on navigation. */
export function RouteFallback() {
  return (
    <div className="flex items-center gap-1.5 py-8" aria-hidden>
      <span className="h-1.5 w-1.5 animate-[soft-pulse_1.2s_ease-in-out_infinite] rounded-full bg-[var(--color-accent)]" />
      <span className="h-1.5 w-1.5 animate-[soft-pulse_1.2s_ease-in-out_0.2s_infinite] rounded-full bg-[var(--color-accent-mid)]" />
      <span className="h-1.5 w-1.5 animate-[soft-pulse_1.2s_ease-in-out_0.4s_infinite] rounded-full bg-[var(--color-brass)]" />
    </div>
  );
}
