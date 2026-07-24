'use client';

import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { AppSidebar } from '@/components/app-shell/sidebar';
import { ToastHost } from '@/components/ui/toast';

type AppShellProps = {
  currentLocale: Locale;
  children: ReactNode;
};

export function AppShell({ currentLocale, children }: AppShellProps) {
  const pathname = usePathname();
  const isFullHeightPage =
    pathname.startsWith('/builder-sales') ||
    pathname.startsWith('/partners') ||
    pathname.startsWith('/venue-map') ||
    pathname.startsWith('/cycles') ||
    pathname.startsWith('/organizations');

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar pathname={pathname} currentLocale={currentLocale} />
      <main
        className={clsx(
          'page-enter min-h-0 min-w-0 flex-1 px-8 py-7',
          isFullHeightPage ? 'flex flex-col overflow-hidden' : 'overflow-auto',
        )}
      >
        {children}
      </main>
      <ToastHost />
    </div>
  );
}
