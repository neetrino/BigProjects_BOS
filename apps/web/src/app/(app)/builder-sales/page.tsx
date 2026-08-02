import { Suspense } from 'react';
import { BuilderSalesPage } from '@/features/builder-crm/builder-sales-page';
import { RouteFallback } from '@/components/ui/route-fallback';

export default function BuilderSalesRoutePage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <BuilderSalesPage />
    </Suspense>
  );
}
