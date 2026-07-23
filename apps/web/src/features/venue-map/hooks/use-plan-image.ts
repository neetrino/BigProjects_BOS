'use client';

import { useEffect, useState } from 'react';

/** Load a cross-origin plan image for Konva. */
export function usePlanImage(imageUrl: string | null): HTMLImageElement | null {
  const [entry, setEntry] = useState<{ url: string; image: HTMLImageElement } | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!cancelled) {
        setEntry({ url: imageUrl, image: img });
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setEntry(null);
      }
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return null;
  }
  return entry?.url === imageUrl ? entry.image : null;
}
