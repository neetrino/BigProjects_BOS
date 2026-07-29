'use client';

import { LogOut } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';
import { StaffAccountsSection } from '@/features/settings/staff-accounts-section';
import { resolveLocale } from '@/i18n/config';
import { logout } from '@/lib/api/auth';

export function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const currentLocale = resolveLocale(useLocale());
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
        router.replace('/login');
        router.refresh();
      } catch {
        showToast(tCommon('unexpectedError'), 'error');
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="page-heading">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </header>

      <div className="flex flex-wrap items-stretch gap-4">
        <section className="panel flex min-w-[18rem] max-w-lg flex-1 flex-col gap-4 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]">
            {t('profile.title')}
          </h2>
          <dl className="grid gap-3 text-sm">
            <div className="flex gap-3 border-b border-[var(--color-border)] pb-3">
              <dt className="w-24 text-[var(--color-muted)]">{t('profile.name')}</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex gap-3 border-b border-[var(--color-border)] pb-3">
              <dt className="w-24 text-[var(--color-muted)]">{t('profile.email')}</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-[var(--color-muted)]">{t('profile.role')}</dt>
              <dd className="font-medium">{t(`staff.roles.${user.role}`)}</dd>
            </div>
          </dl>
        </section>

        <section className="panel flex min-w-[16rem] max-w-sm flex-col gap-4 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]">
            {t('profile.sessionTitle')}
          </h2>
          <div className="mt-auto flex flex-col gap-3">
            <LanguageSwitcher currentLocale={currentLocale} compact />
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full justify-center"
            >
              <LogOut className="size-3.5" aria-hidden />
              {tCommon('logout')}
            </Button>
          </div>
        </section>
      </div>

      {isAdmin ? <StaffAccountsSection /> : null}
    </div>
  );
}
