'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { StaffAccountsSection } from '@/features/settings/staff-accounts-section';
import type { Locale } from '@/i18n/config';

type SettingsPageProps = {
  currentLocale: Locale;
};

export function SettingsPage({ currentLocale }: SettingsPageProps) {
  const t = useTranslations('settings');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-semibold text-[var(--color-fg)]">{t('title')}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
      </header>

      <section className="flex max-w-lg flex-col gap-3">
        <h2 className="text-base font-semibold text-[var(--color-fg)]">{t('profile.title')}</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 text-[var(--color-muted)]">{t('profile.name')}</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-[var(--color-muted)]">{t('profile.email')}</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-[var(--color-muted)]">{t('profile.role')}</dt>
            <dd>{t(`staff.roles.${user.role}`)}</dd>
          </div>
        </dl>
        <div className="pt-1">
          <p className="mb-2 text-xs text-[var(--color-muted)]">{t('profile.language')}</p>
          <LanguageSwitcher currentLocale={currentLocale} compact />
        </div>
      </section>

      {isAdmin ? <StaffAccountsSection /> : null}
    </div>
  );
}
