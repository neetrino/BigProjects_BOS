'use client';

import { clsx } from 'clsx';
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Handshake,
  Map,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useSidebarActiveIndicator } from '@/components/app-shell/use-sidebar-active-indicator';

type NavKey = 'builderSales' | 'partners' | 'venueMap' | 'cycles' | 'organizations' | 'settings';

type SettingsChildKey = 'settingsStaff';

type NavChild = {
  key: SettingsChildKey;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

type NavItem = {
  key: NavKey;
  href?: string;
  soon?: boolean;
  icon: LucideIcon;
  preserveCycle?: boolean;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  { key: 'builderSales', href: '/builder-sales', icon: Store, preserveCycle: true },
  { key: 'partners', href: '/partners', icon: Handshake, preserveCycle: true },
  { key: 'venueMap', href: '/venue-map', icon: Map, preserveCycle: true },
  { key: 'cycles', href: '/cycles', icon: CalendarDays },
  { key: 'organizations', href: '/organizations', icon: Building2 },
  {
    key: 'settings',
    href: '/settings',
    icon: Settings,
    children: [{ key: 'settingsStaff', href: '/settings/staff', icon: Users, adminOnly: true }],
  },
];

const NAV_ROW_CLASS =
  'app-sidebar-nav-row group relative flex min-h-11 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-sm transition-colors duration-200';

function resolveActiveNavId(pathname: string, isAdmin: boolean): string | null {
  for (const item of NAV_ITEMS) {
    const children = (item.children ?? []).filter((child) => !child.adminOnly || isAdmin);
    for (const child of children) {
      if (pathname === child.href || pathname.startsWith(`${child.href}/`)) {
        return child.key;
      }
    }
    if (!item.href || item.soon) {
      continue;
    }
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.key;
    }
  }
  return null;
}

type AppSidebarProps = {
  pathname: string;
};

export function AppSidebar({ pathname }: AppSidebarProps) {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const searchParams = useSearchParams();
  const cycleId = searchParams.get('cycle');
  const settingsOpenByRoute = pathname === '/settings' || pathname.startsWith('/settings/');
  const [settingsOpen, setSettingsOpen] = useState(settingsOpenByRoute);
  const [wasSettingsRoute, setWasSettingsRoute] = useState(settingsOpenByRoute);

  if (settingsOpenByRoute !== wasSettingsRoute) {
    setWasSettingsRoute(settingsOpenByRoute);
    if (settingsOpenByRoute) {
      setSettingsOpen(true);
    }
  }

  const activeNavId = resolveActiveNavId(pathname, isAdmin);
  const { navRef, indicatorStyle, isMoving } = useSidebarActiveIndicator(
    activeNavId,
    `${settingsOpen ? 'open' : 'closed'}:${activeNavId ?? 'none'}`,
  );

  function navHref(item: NavItem): string {
    if (!item.href) {
      return '#';
    }
    if (item.preserveCycle && cycleId) {
      return `${item.href}?cycle=${encodeURIComponent(cycleId)}`;
    }
    return item.href;
  }

  function iconBoxClass(active: boolean): string {
    return clsx(
      'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
      active
        ? 'bg-white text-[var(--color-brand)]'
        : 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white',
    );
  }

  function rowToneClass(active: boolean): string {
    return active
      ? 'font-semibold text-white'
      : 'text-white/70 hover:bg-white/10 hover:text-white';
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

      <nav
        ref={navRef}
        aria-label={t('label')}
        className="relative flex flex-1 flex-col gap-1 px-3 pb-6"
      >
        <span
          aria-hidden
          className={clsx('app-sidebar-active-indicator', isMoving && 'is-moving')}
          style={indicatorStyle}
        />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const children = (item.children ?? []).filter((child) => !child.adminOnly || isAdmin);

          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className="flex min-h-11 items-center justify-between rounded-[var(--radius-control)] px-2.5 py-2.5 text-sm text-white/40"
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

          const isExactActive = pathname === item.href;

          if (children.length > 0) {
            const expanded = settingsOpen;

            return (
              <div key={item.key} className="flex flex-col">
                <div
                  data-sidebar-nav={item.key}
                  className={clsx(NAV_ROW_CLASS, 'pr-1.5', rowToneClass(isExactActive))}
                >
                  <Link
                    href={navHref(item)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-inherit"
                  >
                    <span className={iconBoxClass(isExactActive)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="app-sidebar-nav-label min-w-0 whitespace-pre-line text-left leading-snug">
                      {t(item.key)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label={expanded ? t('collapseSection') : t('expandSection')}
                    aria-expanded={expanded}
                    onClick={() => setSettingsOpen((prev) => !prev)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
                  >
                    <ChevronDown
                      className={clsx(
                        'size-4 transition-transform duration-300 ease-[var(--ease-out-premium)]',
                        expanded && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </button>
                </div>

                <div
                  className={clsx(
                    'app-sidebar-accordion',
                    expanded && 'app-sidebar-accordion-open',
                  )}
                  aria-hidden={!expanded}
                >
                  <div className="app-sidebar-accordion-panel">
                    <div className="flex flex-col gap-1 pl-11 pt-1">
                      {children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive =
                          pathname === child.href || pathname.startsWith(`${child.href}/`);

                        return (
                          <Link
                            key={child.key}
                            href={child.href}
                            data-sidebar-nav={child.key}
                            tabIndex={expanded ? undefined : -1}
                            className={clsx(NAV_ROW_CLASS, rowToneClass(isChildActive))}
                          >
                            <span className={iconBoxClass(isChildActive)}>
                              <ChildIcon className="size-4" aria-hidden />
                            </span>
                            <span className="app-sidebar-nav-label min-w-0 whitespace-pre-line text-left leading-snug">
                              {t(child.key)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const isSectionActive = isExactActive || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={navHref(item)}
              data-sidebar-nav={item.key}
              className={clsx(NAV_ROW_CLASS, rowToneClass(isSectionActive))}
            >
              <span className={iconBoxClass(isSectionActive)}>
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
