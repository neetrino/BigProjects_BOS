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
import Image from 'next/image';
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
    <aside className="app-sidebar relative flex h-fluid-screen w-[16rem] shrink-0 flex-col overflow-hidden">
      <div className="relative px-5 pb-5 pt-7">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
            <Image
              src="/brand-logo.webp"
              alt=""
              width={30}
              height={30}
              className="size-[30px] object-contain"
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="brand-eyebrow">{t('product')}</p>
            <p className="brand-mark mt-1.5 text-[1.2rem] leading-[1.15]">{t('brand')}</p>
          </div>
        </div>
        <div
          aria-hidden
          className="mt-5 h-px w-full bg-gradient-to-r from-white/45 via-white/20 to-transparent"
        />
      </div>

      <nav aria-label={t('label')} className="relative flex flex-1 flex-col gap-1 px-3 pb-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex items-center justify-between rounded-[var(--radius-control)] px-2.5 py-2.5 text-sm text-white/40"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="size-4 opacity-50" aria-hidden />
                  </span>
                  {t(item.key)}
                </span>
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">
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
                'group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-sm transition-colors duration-200',
                isActive
                  ? 'bg-white/15 font-semibold text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-white"
                />
              ) : null}
              <span
                className={clsx(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                  isActive
                    ? 'bg-white text-[var(--color-brand)]'
                    : 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white',
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 whitespace-pre-line text-left text-sm leading-snug tracking-tight">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-white/15 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-control)] border border-white/15 bg-white/10 px-3 py-2.5">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[0.7rem] font-bold tracking-wide text-[var(--color-brand)]"
          >
            {userInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/60">{user.email}</p>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <LanguageSwitcher currentLocale={currentLocale} compact onBrand />
          </div>
          <Button
            variant="onBrand"
            onClick={handleLogout}
            disabled={isPending}
            className="h-auto shrink-0 self-stretch rounded-xl px-3 py-0 text-xs font-semibold tracking-wide"
          >
            <LogOut className="size-3.5" aria-hidden />
            {tCommon('logout')}
          </Button>
        </div>
      </div>
    </aside>
  );
}
