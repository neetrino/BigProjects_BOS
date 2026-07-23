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
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <LanguageSwitcher currentLocale={currentLocale} />
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {t('eyebrow')}
      </p>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
        {t('title')}
      </h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">{t('description')}</p>
      <LoginForm />
    </main>
  );
}
