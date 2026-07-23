'use client';

import { Image as KonvaImage } from 'react-konva';

type BackgroundLayerProps = {
  image: CanvasImageSource | null;
  width: number;
  height: number;
};

export function BackgroundLayer({ image, width, height }: BackgroundLayerProps) {
  if (!image) {
    return null;
  }
  return <KonvaImage image={image} x={0} y={0} width={width} height={height} listening={false} />;
}
