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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-[28rem] w-[28rem] rounded-full bg-[var(--color-accent-soft)]/80 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[var(--color-brass-soft)] blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      </div>

      <LanguageSwitcher currentLocale={currentLocale} />

      <div className="page-enter relative w-full max-w-[26rem]">
        <div className="mb-6 text-center">
          <div
            aria-hidden
            className="brand-tile mx-auto mb-4 size-12 rounded-2xl text-base font-bold"
          >
            B
          </div>
          <p className="brand-eyebrow">{t('eyebrow')}</p>
        </div>

        <div className="surface-card rounded-[1.4rem] p-8 backdrop-blur-md">
          <h1 className="font-[family-name:var(--font-display)] text-[2.35rem] font-medium leading-none tracking-tight text-[var(--color-fg)]">
            {t('title')}
          </h1>
          <div className="mt-4 h-px w-14 bg-gradient-to-r from-[var(--color-brass)] to-transparent" />
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">{t('description')}</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
