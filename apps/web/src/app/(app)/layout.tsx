import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppShell } from '@/components/app-shell/app-shell';
import { fetchCurrentUserServer } from '@/lib/api/auth-server';
import { resolveLocale } from '@/i18n/config';

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await fetchCurrentUserServer();
  if (!user) {
    redirect('/login');
  }

  const currentLocale = resolveLocale(await getLocale());

  return (
    <AuthProvider user={user}>
      <AppShell currentLocale={currentLocale}>{children}</AppShell>
    </AuthProvider>
  );
}
