import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { PartnersPage } from '@/features/partners/partners-page';

export default async function PartnersRoutePage() {
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<p className="py-8 text-sm text-[var(--color-muted)]">{t('loading')}</p>}>
      <PartnersPage />
    </Suspense>
  );
}
