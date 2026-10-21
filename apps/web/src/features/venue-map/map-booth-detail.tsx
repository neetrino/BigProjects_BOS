'use client';

import { useTranslations } from 'next-intl';
import { Field, TextInput } from '@/components/ui/field';
import type { MapBoothPick } from './toonexpo-venue-map-bridge';

type MapBoothDetailProps = {
  booth: MapBoothPick;
};

export function MapBoothDetail({ booth }: MapBoothDetailProps) {
  const t = useTranslations('venueMap');

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('panel.name')} htmlFor="map-booth-name">
        <TextInput id="map-booth-name" value={booth.name} readOnly />
      </Field>
      <Field label={t('panel.code')} htmlFor="map-booth-code">
        <TextInput id="map-booth-code" value={booth.code} readOnly />
      </Field>
      {booth.squareMeters != null ? (
        <p className="text-sm text-[var(--color-muted)]">
          {t('panel.squareMeters', { sqm: booth.squareMeters })}
        </p>
      ) : null}
      {booth.zone ? (
        <Field label={t('panel.zone')} htmlFor="map-booth-zone">
          <TextInput id="map-booth-zone" value={booth.zone} readOnly />
        </Field>
      ) : null}
    </div>
  );
}
