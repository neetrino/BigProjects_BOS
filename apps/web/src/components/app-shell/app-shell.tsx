'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { AppSidebar } from '@/components/app-shell/sidebar';

type AppShellProps = {
  currentLocale: Locale;
  children: ReactNode;
};

export function AppShell({ currentLocale, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <AppSidebar pathname={pathname} currentLocale={currentLocale} />
      <main className="min-w-0 flex-1 overflow-auto px-6 py-5">{children}</main>
    </div>
  );
}
