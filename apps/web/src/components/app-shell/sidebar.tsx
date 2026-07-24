'use client';

import { clsx } from 'clsx';
import {
  Building2,
  CalendarDays,
  Handshake,
  Map,
  Settings,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logout } from '@/lib/api/auth';
import type { Locale } from '@/i18n/config';
import { useAuth } from '@/components/auth/auth-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';

type NavKey = 'builderSales' | 'partners' | 'venueMap' | 'cycles' | 'organizations' | 'settings';

type NavItem = {
  key: NavKey;
  href?: string;
  soon?: boolean;
  icon: LucideIcon;
  preserveCycle?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'builderSales', href: '/builder-sales', icon: Store, preserveCycle: true },
  { key: 'partners', href: '/partners', icon: Handshake, preserveCycle: true },
  { key: 'venueMap', href: '/venue-map', icon: Map, preserveCycle: true },
  { key: 'cycles', href: '/cycles', icon: CalendarDays },
  { key: 'organizations', href: '/organizations', icon: Building2 },
  { key: 'settings', href: '/settings', icon: Settings },
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
  const searchParams = useSearchParams();
  const cycleId = searchParams.get('cycle');
  const [isPending, startTransition] = useTransition();

  function navHref(item: NavItem): string {
    if (!item.href) {
      return '#';
    }
    if (item.preserveCycle && cycleId) {
      return `${item.href}?cycle=${encodeURIComponent(cycleId)}`;
    }
    return item.href;
  }
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
    <aside className="relative flex h-screen w-[17rem] shrink-0 flex-col border-r border-[var(--color-border)] bg-[linear-gradient(180deg,#fffcf9_0%,#f7fafc_100%)] shadow-[var(--shadow-nav)]">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[var(--color-brass)]/25 to-transparent" />

      <div className="px-5 pb-4 pt-6">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="brand-tile mt-0.5 size-10 rounded-xl text-sm font-bold tracking-tight"
          >
            B
          </div>
          <div className="min-w-0">
            <p className="brand-eyebrow">{t('product')}</p>
            <p className="brand-mark mt-1 text-[1.15rem] leading-tight">{t('brand')}</p>
          </div>
        </div>
      </div>

      <nav aria-label={t('label')} className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-muted)]/70"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 opacity-60" aria-hidden />
                  {t(item.key)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {t('soon')}
                </span>
              </span>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={navHref(item)}
              className={clsx(
                'group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-white/80 hover:text-[var(--color-fg)] hover:shadow-sm',
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-1 w-[3px] rounded-full bg-[var(--color-accent)]"
                />
              ) : null}
              <Icon
                className={clsx(
                  'size-4 shrink-0 transition-colors',
                  isActive ? 'text-[var(--color-accent)]' : 'opacity-70 group-hover:opacity-100',
                )}
                aria-hidden
              />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgb(247_243_238/0.35),rgb(247_243_238/0.7))] px-4 py-4">
        <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white/90 px-3 py-2.5 shadow-sm">
          <p className="truncate text-sm font-semibold text-[var(--color-fg)]">{user.name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
        </div>
        <LanguageSwitcher currentLocale={currentLocale} compact />
        <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
          {tCommon('logout')}
        </Button>
      </div>
    </aside>
  );
}
