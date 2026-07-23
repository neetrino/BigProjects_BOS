import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { VenueMapPage } from '@/features/venue-map/venue-map-page';

export default async function VenueMapRoutePage() {
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<p className="py-8 text-sm text-[var(--color-muted)]">{t('loading')}</p>}>
      <VenueMapPage />
    </Suspense>
  );
}
