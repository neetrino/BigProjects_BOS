import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppShell } from '@/components/app-shell/app-shell';
import { fetchCurrentUserServer } from '@/lib/api/auth-server';

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await fetchCurrentUserServer();
  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider user={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
