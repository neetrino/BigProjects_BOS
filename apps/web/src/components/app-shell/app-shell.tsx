'use client';

import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-shell/sidebar';
import { ToastHost } from '@/components/ui/toast';
import { APP_PORTAL_ROOT_ID } from '@/lib/portal-root';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFullHeightPage =
    pathname.startsWith('/builder-sales') ||
    pathname.startsWith('/partners') ||
    pathname.startsWith('/venue-map') ||
    pathname.startsWith('/cycles') ||
    pathname.startsWith('/organizations');

  return (
    <div className="desktop-fluid-frame desktop-fluid-frame-start">
      <div className="desktop-fluid-stage">
        <div className="flex h-fluid-screen overflow-hidden">
          <AppSidebar pathname={pathname} />
          <main
            className={clsx(
              'page-enter min-h-0 min-w-0 flex-1 px-8 py-7',
              isFullHeightPage ? 'flex flex-col overflow-hidden' : 'overflow-auto',
            )}
          >
            {children}
          </main>
        </div>
        <ToastHost />
        <div id={APP_PORTAL_ROOT_ID} />
      </div>
    </div>
  );
}
