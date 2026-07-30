'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { StaffAccountsSection } from '@/features/settings/staff-accounts-section';

export function StaffSettingsPage() {
  const t = useTranslations('settings.staff');
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/settings');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header>
        <h1 className="page-heading">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </header>
      <StaffAccountsSection />
    </div>
  );
}
