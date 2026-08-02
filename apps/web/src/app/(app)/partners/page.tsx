import { Suspense } from 'react';
import { PartnersPage } from '@/features/partners/partners-page';
import { RouteFallback } from '@/components/ui/route-fallback';

export default function PartnersRoutePage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PartnersPage />
    </Suspense>
  );
}
