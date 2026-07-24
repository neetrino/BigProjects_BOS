'use client';

import { clsx } from 'clsx';
import {
  Building2,
  CalendarDays,
  Handshake,
  LogOut,
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

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

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
    <aside className="app-sidebar relative flex h-screen w-[17.5rem] shrink-0 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[var(--color-accent-soft)]/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-24 h-64 w-64 rounded-full bg-[var(--color-brass-soft)]/90 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[var(--color-brass)]/35 to-transparent"
      />

      <div className="relative px-5 pb-5 pt-7">
        <div className="flex items-start gap-3.5">
          <div
            aria-hidden
            className="brand-tile mt-0.5 size-11 rounded-2xl text-[0.95rem] font-bold tracking-tight"
          >
            B
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="brand-eyebrow">{t('product')}</p>
            <p className="brand-mark mt-1.5 text-[1.2rem] leading-[1.15]">{t('brand')}</p>
          </div>
        </div>
        <div
          aria-hidden
          className="mt-5 h-px w-full bg-gradient-to-r from-[var(--color-brass)] via-[var(--color-brass)]/35 to-transparent"
        />
      </div>

      <nav aria-label={t('label')} className="relative flex flex-1 flex-col gap-1 px-3 pb-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex items-center justify-between rounded-[var(--radius-control)] px-2.5 py-2.5 text-sm text-[var(--color-muted)]/55"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--color-bg-warm)]/60">
                    <Icon className="size-4 opacity-50" aria-hidden />
                  </span>
                  {t(item.key)}
                </span>
                <span className="rounded-md bg-[var(--color-brass-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-brass)]">
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
                'group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-sm transition-all duration-200',
                isActive
                  ? 'bg-[linear-gradient(135deg,rgb(213_238_240/0.95),rgb(255_252_248/0.9))] font-semibold text-[var(--color-accent)] shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_8px_20px_rgb(15_107_110/0.08)] outline outline-1 outline-[var(--color-accent-soft)]'
                  : 'text-[var(--color-muted)] hover:bg-white/70 hover:text-[var(--color-fg)] hover:shadow-[0_1px_0_rgb(255_255_255/0.9)_inset]',
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-brass)] to-[var(--color-accent)]"
                />
              ) : null}
              <span
                className={clsx(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-[linear-gradient(145deg,var(--color-accent-mid),var(--color-accent))] text-white shadow-[0_6px_14px_rgb(15_107_110/0.28)]'
                    : 'bg-[var(--color-bg-warm)]/80 text-[var(--color-muted)] group-hover:bg-white group-hover:text-[var(--color-fg)] group-hover:shadow-sm',
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="truncate tracking-tight">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-[var(--color-border)]/80 bg-[linear-gradient(180deg,rgb(247_243_238/0.25),rgb(247_243_238/0.72))] px-4 py-4 backdrop-blur-[2px]">
        <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-control)] border border-white/80 bg-white/85 px-3 py-2.5 shadow-[var(--shadow-soft)] outline outline-1 outline-[var(--color-border)]">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--color-brass),#8f7040)] text-[0.7rem] font-bold tracking-wide text-white shadow-[0_4px_12px_rgb(164_132_79/0.35)]"
          >
            {userInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-[var(--color-fg)]">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-[var(--color-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="mb-3">
          <LanguageSwitcher currentLocale={currentLocale} compact />
        </div>

        <Button
          variant="secondary"
          onClick={handleLogout}
          disabled={isPending}
          className="w-full justify-center gap-2 border-[var(--color-border)] bg-white/75 text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:bg-white hover:text-[var(--color-fg)]"
        >
          <LogOut className="size-3.5" aria-hidden />
          {tCommon('logout')}
        </Button>
      </div>
    </aside>
  );
}
