import { fetchHealth } from '@/lib/api/health';

export default async function HomePage() {
  const healthResult = await loadHealth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
        Internal tool
      </p>
      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-[var(--color-fg)]">
        BigProjects BOS
      </h1>
      <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
        Phase 0 foundation check: the Next.js frontend calls the NestJS health endpoint.
      </p>

      <section
        aria-label="API health"
        className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"
      >
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--color-muted)]">
          API health
        </h2>
        {healthResult.ok ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">Status</dt>
              <dd>{healthResult.data.status}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">Database</dt>
              <dd>{healthResult.data.database}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">Timestamp</dt>
              <dd>{healthResult.data.timestamp}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            API unreachable. Start `apps/api` and ensure `NEXT_PUBLIC_API_URL` points to it.
          </p>
        )}
      </section>
    </main>
  );
}

async function loadHealth() {
  try {
    const data = await fetchHealth();
    return { ok: true as const, data };
  } catch {
    return { ok: false as const };
  }
}
