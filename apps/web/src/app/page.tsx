import { getLocale, getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';
import { resolveLocale } from '@/i18n/config';
import { fetchHealth } from '@/lib/api/health';

export default async function HomePage() {
  const t = await getTranslations('home');
  const currentLocale = resolveLocale(await getLocale());
  const healthResult = await loadHealth();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <LanguageSwitcher currentLocale={currentLocale} />

      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {t('eyebrow')}
      </p>
      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-[var(--color-fg)]">
        {t('title')}
      </h1>
      <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
        {t('description')}
      </p>

      <section
        aria-label={t('health.sectionLabel')}
        className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"
      >
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {t('health.sectionLabel')}
        </h2>
        {healthResult.ok ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">{t('health.status')}</dt>
              <dd>{healthResult.data.status}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">{t('health.database')}</dt>
              <dd>{healthResult.data.database}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--color-muted)]">{t('health.timestamp')}</dt>
              <dd>{healthResult.data.timestamp}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">{t('health.unreachable')}</p>
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
