'use client';

import { Hand, Maximize2, Minimize2, MousePointer2, Ruler, Save, Scan } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { TOOLBAR_CONTROL_CLASS } from './constants';
import type { EditorInteractionMode } from './venue-map-stage';

type VenueMapToolbarProps = {
  isAdmin: boolean;
  interactionMode: EditorInteractionMode;
  mapFullscreen: boolean;
  onInteractionModeChange: (mode: EditorInteractionMode) => void;
  onFit: () => void;
  onSaveLayout: () => void;
  saveLayoutBusy: boolean;
  layoutDirty: boolean;
  onToggleFullscreen: () => void;
};

export function VenueMapToolbar({
  isAdmin,
  interactionMode,
  mapFullscreen,
  onInteractionModeChange,
  onFit,
  onSaveLayout,
  saveLayoutBusy,
  layoutDirty,
  onToggleFullscreen,
}: VenueMapToolbarProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        variant={interactionMode === 'select' ? 'primary' : 'secondary'}
        className={TOOLBAR_CONTROL_CLASS}
        onClick={() => onInteractionModeChange('select')}
      >
        <MousePointer2 className="size-4" aria-hidden />
        {t('toolbar.select')}
      </Button>
      <Button
        variant={interactionMode === 'pan' ? 'primary' : 'secondary'}
        className={TOOLBAR_CONTROL_CLASS}
        onClick={() => onInteractionModeChange('pan')}
      >
        <Hand className="size-4" aria-hidden />
        {t('toolbar.pan')}
      </Button>
      {isAdmin ? (
        <Button
          variant={interactionMode === 'calibrate' ? 'primary' : 'secondary'}
          className={TOOLBAR_CONTROL_CLASS}
          onClick={() => onInteractionModeChange('calibrate')}
        >
          <Ruler className="size-4" aria-hidden />
          {t('toolbar.calibrate')}
        </Button>
      ) : null}
      <Button variant="secondary" className={TOOLBAR_CONTROL_CLASS} onClick={onFit}>
        <Scan className="size-4" aria-hidden />
        {t('toolbar.fit')}
      </Button>
      <Button
        variant={layoutDirty ? 'primary' : 'secondary'}
        className={TOOLBAR_CONTROL_CLASS}
        disabled={saveLayoutBusy || !layoutDirty}
        onClick={onSaveLayout}
      >
        <Save className="size-4" aria-hidden />
        {saveLayoutBusy ? tCommon('saving') : t('toolbar.saveLayout')}
      </Button>
      <Button
        variant={mapFullscreen ? 'primary' : 'secondary'}
        className={TOOLBAR_CONTROL_CLASS}
        onClick={onToggleFullscreen}
        aria-pressed={mapFullscreen}
        title={mapFullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
      >
        {mapFullscreen ? (
          <Minimize2 className="size-4" aria-hidden />
        ) : (
          <Maximize2 className="size-4" aria-hidden />
        )}
        {mapFullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
      </Button>
    </div>
  );
}
