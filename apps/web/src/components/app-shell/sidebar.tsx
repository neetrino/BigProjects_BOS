'use client';

import { clsx } from 'clsx';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { buildNavHref, NAV_ITEMS, resolveActiveNavId } from '@/components/app-shell/sidebar-nav';
import { useSidebarActiveIndicator } from '@/components/app-shell/use-sidebar-active-indicator';

const NAV_ROW_CLASS =
  'app-sidebar-nav-row group relative z-[1] flex min-h-11 w-full min-w-0 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-sm leading-snug transition-colors duration-200';

type AppSidebarProps = {
  pathname: string;
};

export function AppSidebar({ pathname }: AppSidebarProps) {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const searchParams = useSearchParams();
  const cycleId = searchParams.get('cycle');
  const [collapsed, setCollapsed] = useState(false);

  const activeNavId = resolveActiveNavId(pathname, isAdmin);
  const { navRef, indicatorStyle, isMoving } = useSidebarActiveIndicator(
    activeNavId,
    `${collapsed ? 'c' : 'e'}:${activeNavId ?? 'none'}`,
  );

  function iconBoxClass(active: boolean): string {
    return clsx(
      'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
      active
        ? 'bg-white text-[var(--color-brand)]'
        : 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white',
    );
  }

  function rowToneClass(active: boolean): string {
    return active ? 'font-semibold text-white' : 'text-white/70 hover:text-white';
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={clsx(
        'app-sidebar relative flex h-fluid-screen shrink-0 flex-col overflow-hidden',
        collapsed && 'is-collapsed',
      )}
    >
      <div className="app-sidebar-brand relative px-3 pb-5 pt-7">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
            <Image
              src="/brand-logo.webp"
              alt=""
              width={30}
              height={30}
              className="size-[30px] object-contain"
            />
          </div>
          <div className="app-sidebar-brand-copy min-w-0">
            <p className="brand-eyebrow">{t('product')}</p>
            <p className="brand-mark mt-1 text-[calc(1.15rem+0.5px)]">{t('brand')}</p>
          </div>
        </div>
        <div
          aria-hidden
          className="app-sidebar-brand-rule mx-2 mt-5 h-px bg-gradient-to-r from-white/45 via-white/20 to-transparent"
        />
      </div>

      <nav
        aria-label={t('label')}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3"
      >
        <div ref={navRef} className="relative flex min-h-0 w-full flex-1 flex-col gap-1">
          <span
            aria-hidden
            className={clsx('app-sidebar-active-indicator', isMoving && 'is-moving')}
            style={indicatorStyle}
          />

          {visibleItems.map((item) => {
            const Icon = item.icon;

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
                    <span className="app-sidebar-nav-label">{t(item.key)}</span>
                  </span>
                  <span className="app-sidebar-nav-label rounded-md bg-white/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/70">
                    {t('soon')}
                  </span>
                </span>
              );
            }

            const isActive = activeNavId === item.key;

            return (
              <Link
                key={item.key}
                href={buildNavHref(item, cycleId)}
                data-sidebar-nav={item.key}
                title={collapsed ? t(item.key) : undefined}
                className={clsx(NAV_ROW_CLASS, rowToneClass(isActive))}
              >
                <span className={iconBoxClass(isActive)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="app-sidebar-nav-label">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={clsx('flex px-3 pb-4 pt-1', collapsed ? 'justify-center' : 'justify-end')}>
        <button
          type="button"
          aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
        >
          <ChevronLeft
            className={clsx(
              'size-5 transition-transform duration-300 ease-[var(--ease-out-premium)]',
              collapsed && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </div>
    </aside>
  );
}
