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
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
};

export function AppSidebar({ pathname }: AppSidebarProps) {
  const t = useTranslations('nav');
  const searchParams = useSearchParams();
  const cycleId = searchParams.get('cycle');

  function navHref(item: NavItem): string {
    if (!item.href) {
      return '#';
    }
    if (item.preserveCycle && cycleId) {
      return `${item.href}?cycle=${encodeURIComponent(cycleId)}`;
    }
    return item.href;
  }

  return (
    <aside className="app-sidebar relative flex h-fluid-screen shrink-0 flex-col overflow-hidden">
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
            <p className="brand-mark mt-1.5 text-[calc(1.2rem+0.5px)] leading-[1.15]">
              {t('brand')}
            </p>
          </div>
        </div>
        <div
          aria-hidden
          className="mt-5 h-px w-full bg-gradient-to-r from-white/45 via-white/20 to-transparent"
        />
      </div>

      <nav aria-label={t('label')} className="relative flex flex-1 flex-col gap-1 px-3 pb-6">
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
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/70">
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
              <span className="app-sidebar-nav-label min-w-0 whitespace-pre-line text-left text-sm leading-snug">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
