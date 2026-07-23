'use client';

import dynamic from 'next/dynamic';
import type { VenueMapStageProps } from './venue-map-stage';

const VenueMapStageDynamic = dynamic(
  () => import('./venue-map-stage').then((mod) => ({ default: mod.VenueMapStage })),
  { ssr: false, loading: () => <div className="h-full w-full bg-[var(--color-bg)]" /> },
);

/** Konva Stage must not SSR — wraps the editor canvas with `next/dynamic`. */
export function VenueMapStageClient(props: VenueMapStageProps) {
  return <VenueMapStageDynamic {...props} />;
}
