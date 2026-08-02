import { Suspense } from 'react';
import { VenueMapPage } from '@/features/venue-map/venue-map-page';
import { RouteFallback } from '@/components/ui/route-fallback';

export default function VenueMapRoutePage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <VenueMapPage />
    </Suspense>
  );
}
