import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { BuilderSalesPage } from '@/features/builder-crm/builder-sales-page';

export default async function BuilderSalesRoutePage() {
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<p className="py-8 text-sm text-[var(--color-muted)]">{t('loading')}</p>}>
      <BuilderSalesPage />
    </Suspense>
  );
}
