'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchInput } from '@/components/ui/field';
import type { VenueSpaceArea } from '@/lib/api/venue-map';
import type { MapBoothPick } from './toonexpo-venue-map-bridge';

type BoothListProps = {
  areas: readonly VenueSpaceArea[];
  mapBooths: readonly MapBoothPick[];
  selectedAreaId: string | null;
  selectedBoothId: string | null;
  onSelectArea: (areaId: string | null) => void;
  onSelectBooth: (booth: MapBoothPick | null) => void;
};

export function BoothList({
  areas,
  mapBooths,
  selectedAreaId,
  selectedBoothId,
  onSelectArea,
  onSelectBooth,
}: BoothListProps) {
  const t = useTranslations('venueMap');
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const normalized = query.trim().toLowerCase();

  const visibleBooths = useMemo(
    () =>
      sortSparseLast(
        mapBooths.filter((item) => matchesBooth(item, normalized)),
        lacksBoothIdentity,
      ),
    [mapBooths, normalized],
  );
  const visibleAreas = useMemo(
    () =>
      sortSparseLast(
        areas.filter((item) => matchesArea(item, normalized)),
        lacksAreaIdentity,
      ),
    [areas, normalized],
  );
  const selectedBooth = useMemo(
    () =>
      mapBooths.find(
        (item) =>
          item.id === selectedBoothId ||
          item.code === selectedBoothId ||
          (selectedAreaId != null && item.areaId === selectedAreaId),
      ) ?? null,
    [mapBooths, selectedAreaId, selectedBoothId],
  );
  const selectedArea = useMemo(
    () => areas.find((item) => item.id === selectedAreaId) ?? null,
    [areas, selectedAreaId],
  );

  useEffect(() => {
    const selected = listRef.current?.querySelector('[data-selected="true"]');
    if (selected instanceof HTMLElement) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedAreaId, selectedBoothId, visibleBooths, visibleAreas]);

  if (mapBooths.length === 0 && areas.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">{t('panel.noAreas')}</p>;
  }

  const items = mapBooths.length > 0 ? visibleBooths.length : visibleAreas.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('panel.searchPlaceholder')}
        aria-label={t('panel.searchPlaceholder')}
      />
      {items === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('panel.searchEmpty')}</p>
      ) : mapBooths.length > 0 ? (
        <ul
          ref={listRef}
          className="soft-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5"
        >
          {visibleBooths.map((item) => {
            const isSelected = isBoothSelected(item, selectedBooth, selectedAreaId);

            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  data-selected={isSelected ? 'true' : undefined}
                  onClick={() => onSelectBooth(item)}
                  className={listButtonClass(isSelected)}
                >
                  <BoothRow
                    name={item.name}
                    meta={item.squareMeters != null ? `${item.squareMeters} m²` : item.code}
                    selected={isSelected}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul
          ref={listRef}
          className="soft-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5"
        >
          {visibleAreas.map((item) => {
            const isSelected = isAreaSelected(item, selectedArea, selectedAreaId);
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  data-selected={isSelected ? 'true' : undefined}
                  onClick={() => onSelectArea(item.id)}
                  className={listButtonClass(isSelected)}
                >
                  <BoothRow
                    name={item.name}
                    meta={`${item.squareMeters} m²`}
                    selected={isSelected}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function lacksBoothIdentity(item: MapBoothPick): boolean {
  return item.code.trim() === '' && item.squareMeters == null;
}

function lacksAreaIdentity(item: VenueSpaceArea): boolean {
  return (item.code ?? '').trim() === '' && item.squareMeters == null;
}

function sortSparseLast<T>(items: readonly T[], isSparse: (item: T) => boolean): T[] {
  return [...items].sort((left, right) => Number(isSparse(left)) - Number(isSparse(right)));
}

function isBoothSelected(
  item: MapBoothPick,
  selected: MapBoothPick | null,
  selectedAreaId: string | null,
): boolean {
  if (selectedAreaId != null && item.areaId === selectedAreaId) {
    return true;
  }
  if (!selected) {
    return false;
  }
  if (item.id === selected.id || (item.code !== '' && item.code === selected.code)) {
    return true;
  }
  const name = normalizeName(selected.name);
  return name !== '' && normalizeName(item.name) === name;
}

function isAreaSelected(
  item: VenueSpaceArea,
  selected: VenueSpaceArea | null,
  selectedAreaId: string | null,
): boolean {
  if (selectedAreaId != null && item.id === selectedAreaId) {
    return true;
  }
  if (!selected) {
    return false;
  }
  const name = normalizeName(selected.name);
  return name !== '' && normalizeName(item.name) === name;
}

function matchesBooth(item: MapBoothPick, query: string): boolean {
  if (!query) {
    return true;
  }
  return [
    item.name,
    item.code,
    item.zone,
    item.squareMeters != null ? String(item.squareMeters) : '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function matchesArea(item: VenueSpaceArea, query: string): boolean {
  if (!query) {
    return true;
  }
  return [item.name, item.code ?? '', String(item.squareMeters)]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function listButtonClass(selected: boolean): string {
  return clsx(
    'flex w-full items-center gap-2.5 rounded-[var(--radius-control)] border px-2.5 py-2 text-left transition-colors duration-150',
    selected
      ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-[var(--shadow-soft)]'
      : 'border-[var(--color-border)] bg-white/80 hover:border-[var(--color-border-strong)] hover:bg-white',
  );
}

function BoothRow({ name, meta, selected }: { name: string; meta: string; selected: boolean }) {
  return (
    <>
      <span
        className={clsx(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
          selected
            ? 'bg-white/20 text-white'
            : 'bg-[var(--color-accent-soft)] text-[var(--color-brand)]',
        )}
      >
        <MapPin className="size-4" aria-hidden strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={clsx(
            'block truncate text-sm',
            selected ? 'font-semibold text-white' : 'font-medium text-[var(--color-fg)]',
          )}
        >
          {name}
        </span>
        <span className={clsx('text-xs', selected ? 'text-white/80' : 'text-[var(--color-muted)]')}>
          {meta}
        </span>
      </span>
    </>
  );
}
