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
  { key: 'builderSales', soon: true },
  { key: 'partners', soon: true },
  { key: 'venueMap', soon: true },
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
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {t('product')}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-fg)]">{t('brand')}</p>
      </div>

      <nav aria-label={t('label')} className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex items-center justify-between rounded px-2.5 py-2 text-sm text-[var(--color-muted)]/70"
              >
                <span>{t(item.key)}</span>
                <span className="text-[10px] uppercase tracking-wide">{t('soon')}</span>
              </span>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <a
              key={item.key}
              href={item.href}
              className={clsx(
                'rounded px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-bg)] font-medium text-[var(--color-fg)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)]',
              )}
            >
              {t(item.key)}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-[var(--color-border)] px-3 py-3">
        <div>
          <p className="truncate text-sm font-medium text-[var(--color-fg)]">{user.name}</p>
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
