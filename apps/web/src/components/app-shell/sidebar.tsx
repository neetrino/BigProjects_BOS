'use client';

import { clsx } from 'clsx';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logout } from '@/lib/api/auth';
import type { Locale } from '@/i18n/config';
import { useAuth } from '@/components/auth/auth-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { HealthIndicator } from '@/components/app-shell/health-indicator';
import { Button } from '@/components/ui/button';

type NavKey = 'builderSales' | 'partners' | 'venueMap' | 'cycles' | 'organizations' | 'settings';

type NavItem = {
  key: NavKey;
  href?: string;
  soon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'builderSales', href: '/builder-sales' },
  { key: 'partners', href: '/partners' },
  { key: 'venueMap', href: '/venue-map' },
  { key: 'cycles', href: '/cycles' },
  { key: 'organizations', href: '/organizations' },
  { key: 'settings', href: '/settings' },
];

type AppSidebarProps = {
  pathname: string;
  currentLocale: Locale;
};

export function AppSidebar({ pathname, currentLocale }: AppSidebarProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        router.replace('/login');
        router.refresh();
      }
    });
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/90 shadow-[var(--shadow-soft)] backdrop-blur-md">
      <div className="border-b border-[var(--color-border)] px-5 py-5">
        <p className="brand-eyebrow">{t('product')}</p>
        <p className="brand-mark mt-1.5 text-lg leading-none">{t('brand')}</p>
        <div className="mt-3 h-px w-10 bg-[var(--color-brass)]/70" />
      </div>

      <nav aria-label={t('label')} className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-muted)]/70"
              >
                <span>{t(item.key)}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {t('soon')}
                </span>
              </span>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <a
              key={item.key}
              href={item.href}
              className={clsx(
                'rounded-[var(--radius-control)] px-3 py-2.5 text-sm transition-all duration-150',
                isActive
                  ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)] shadow-sm'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)]',
              )}
            >
              {t(item.key)}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-warm)]/50 px-4 py-4">
        <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{user.name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
        </div>
        <LanguageSwitcher currentLocale={currentLocale} compact />
        <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
          {tCommon('logout')}
        </Button>
        <HealthIndicator />
      </div>
    </aside>
  );
}
