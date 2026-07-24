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
        <h1 className="page-heading">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </header>

      <section className="panel flex max-w-lg flex-col gap-4 p-5">
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
        <div className="pt-1">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)]">
            {t('profile.language')}
          </p>
          <LanguageSwitcher currentLocale={currentLocale} compact />
        </div>
      </section>

      {isAdmin ? <StaffAccountsSection /> : null}
    </div>
  );
}
