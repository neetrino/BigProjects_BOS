import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LoginForm } from '@/app/login/login-form';
import { fetchCurrentUserServer } from '@/lib/api/auth-server';
import { resolveLocale } from '@/i18n/config';

export default async function LoginPage() {
  const user = await fetchCurrentUserServer();
  if (user) {
    redirect('/cycles');
  }

  const t = await getTranslations('login');
  const currentLocale = resolveLocale(await getLocale());

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--color-accent-soft)]/70 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[var(--color-brass-soft)] blur-3xl" />
      </div>

      <LanguageSwitcher currentLocale={currentLocale} />

      <div className="relative w-full max-w-md rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-8 shadow-[var(--shadow-lift)] backdrop-blur-sm">
        <p className="brand-eyebrow">{t('eyebrow')}</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[var(--color-fg)]">
          {t('title')}
        </h1>
        <div className="mt-4 h-px w-12 bg-[var(--color-brass)]/80" />
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">{t('description')}</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
