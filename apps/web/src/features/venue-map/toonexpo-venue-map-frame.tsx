'use client';

import { useEffect, useRef, useState } from 'react';
import type { VenueSpaceArea } from '@/lib/api/venue-map';
import type { GridCell } from './domain/grid-transform';
import {
  BOS_MAP_MESSAGE,
  bosCatalogBooths,
  bosMovedBooth,
  bosSelectedBooth,
  bosSelectionToGridCells,
  isBosMapEnvelope,
  isVenueMapMessage,
  postToVenueMap,
  toBosMapAreas,
  TOONEXPO_VENUE_MAP_SRC,
  type BosMapMode,
  type MapBoothPick,
} from './toonexpo-venue-map-bridge';
import type { EditorInteractionMode } from './venue-map-stage';

type ToonExpoVenueMapFrameProps = {
  fitRequestId: number;
  clearDirtyRequestId: number;
  title: string;
  interactionMode: EditorInteractionMode;
  areas: readonly VenueSpaceArea[];
  selectedAreaId: string | null;
  focusRequestId: number;
  onSelectBooth: (booth: MapBoothPick | null) => void;
  onBoothMoved: (booth: MapBoothPick) => void;
  onCatalog: (booths: MapBoothPick[]) => void;
  onSelectionComplete: (cells: GridCell[]) => void;
};

/**
 * Same-origin TOON Expo hall. Click/select events go to the BOS right panel.
 */
export function ToonExpoVenueMapFrame({
  fitRequestId,
  clearDirtyRequestId,
  title,
  interactionMode,
  areas,
  selectedAreaId,
  focusRequestId,
  onSelectBooth,
  onBoothMoved,
  onCatalog,
  onSelectionComplete,
}: ToonExpoVenueMapFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isVenueMapMessage(event, frameRef.current?.contentWindow ?? null)) {
        return;
      }
      if (!isBosMapEnvelope(event.data)) {
        return;
      }
      if (event.data.type === BOS_MAP_MESSAGE.ready) {
        setReady(true);
        return;
      }
      const catalog = bosCatalogBooths(event.data);
      if (catalog) {
        onCatalog(catalog);
        return;
      }
      const cells = bosSelectionToGridCells(event.data);
      if (cells.length > 0) {
        onSelectionComplete(cells);
        return;
      }
      const moved = bosMovedBooth(event.data);
      if (moved) {
        onBoothMoved(moved);
        return;
      }
      const booth = bosSelectedBooth(event.data);
      if (booth !== undefined) {
        onSelectBooth(booth);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onBoothMoved, onCatalog, onSelectBooth, onSelectionComplete]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const target = frameRef.current?.contentWindow ?? null;
    const mode: BosMapMode = interactionMode;
    postToVenueMap(target, { type: BOS_MAP_MESSAGE.needCatalog });
    postToVenueMap(target, { type: BOS_MAP_MESSAGE.mode, mode });
    postToVenueMap(target, {
      type: BOS_MAP_MESSAGE.areas,
      areas: toBosMapAreas(areas),
      selectedAreaId,
    });
  }, [ready, interactionMode, areas, selectedAreaId]);

  useEffect(() => {
    if (!ready || !selectedAreaId) {
      return;
    }
    postToVenueMap(frameRef.current?.contentWindow ?? null, {
      type: BOS_MAP_MESSAGE.highlight,
      boothId: selectedAreaId,
    });
  }, [ready, selectedAreaId, focusRequestId]);

  useEffect(() => {
    if (fitRequestId === 0 || !ready) {
      return;
    }
    postToVenueMap(frameRef.current?.contentWindow ?? null, { type: BOS_MAP_MESSAGE.fit });
  }, [fitRequestId, ready]);

  useEffect(() => {
    if (clearDirtyRequestId === 0 || !ready) {
      return;
    }
    postToVenueMap(frameRef.current?.contentWindow ?? null, { type: BOS_MAP_MESSAGE.clearDirty });
  }, [clearDirtyRequestId, ready]);

  return (
    <iframe
      ref={frameRef}
      title={title}
      src={TOONEXPO_VENUE_MAP_SRC}
      className="h-full min-h-0 w-full border-0 bg-[var(--color-bg)]"
      onLoad={() => setReady(true)}
    />
  );
}
