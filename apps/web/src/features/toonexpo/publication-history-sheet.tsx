'use client';

import { clsx } from 'clsx';
import { CalendarDays, CircleCheck, CircleX, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { VenueMapPublication, VenueMapPublicationStatus } from '@/lib/api/toonexpo';
import { Sheet } from '@/components/ui/sheet';
import { formatDateTime } from '@/lib/format';

const PUBLISHED_LIKE: ReadonlySet<VenueMapPublicationStatus> = new Set([
  'PUBLISHED',
  'ALREADY_PUBLISHED',
]);

type StatusVisual = {
  icon: typeof CircleCheck;
  className: string;
};

function statusVisual(status: VenueMapPublicationStatus): StatusVisual {
  if (PUBLISHED_LIKE.has(status)) {
    return {
      icon: CircleCheck,
      className: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
    };
  }
  if (status === 'REJECTED' || status === 'FAILED') {
    return {
      icon: CircleX,
      className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    };
  }
  return {
    icon: Clock,
    className: 'bg-[var(--color-brass-soft)] text-[var(--color-brass)]',
  };
}

function rowAccentClass(status: VenueMapPublicationStatus): string {
  if (PUBLISHED_LIKE.has(status)) {
    return 'border-l-[var(--color-success)]';
  }
  if (status === 'REJECTED' || status === 'FAILED') {
    return 'border-l-[var(--color-danger)]';
  }
  return 'border-l-[var(--color-brass)]';
}

type PublicationHistoryRowProps = {
  row: VenueMapPublication;
  compact?: boolean;
};

export function PublicationHistoryRow({ row, compact = false }: PublicationHistoryRowProps) {
  const t = useTranslations('toonexpo');
  const visual = statusVisual(row.status);
  const StatusIcon = visual.icon;

  return (
    <li
      className={clsx(
        'rounded-xl border border-[var(--color-border)] border-l-4 bg-[var(--color-surface)]',
        rowAccentClass(row.status),
      )}
    >
      <div className={clsx('flex items-center gap-2.5 px-3.5', compact ? 'py-3' : 'py-2.5')}>
        <span className="inline-flex w-fit rounded-lg bg-[var(--color-success-soft)] px-2.5 py-1 text-xs font-bold text-[var(--color-success)]">
          {t('publication.version', { version: row.snapshotVersion })}
        </span>
        <span
          className={clsx(
            'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            visual.className,
          )}
        >
          <StatusIcon className="size-3.5 shrink-0" aria-hidden />
          {t(`publication.status.${row.status}`)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--color-fg)]">
          <CalendarDays className="size-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
          {formatDateTime(row.publishedAt ?? row.createdAt)}
        </span>
      </div>
      {row.status !== 'FAILED' && row.errorMessage ? (
        <p className="border-t border-[var(--color-border)] px-3.5 py-1.5 text-[11px] text-[var(--color-danger)]">
          {row.errorMessage}
        </p>
      ) : null}
    </li>
  );
}

type PublicationHistorySheetProps = {
  open: boolean;
  publications: VenueMapPublication[];
  onClose: () => void;
};

export function PublicationHistorySheet({
  open,
  publications,
  onClose,
}: PublicationHistorySheetProps) {
  const t = useTranslations('toonexpo');

  return (
    <Sheet
      open={open}
      title={t('publication.historyModalTitle')}
      subtitle={t('publication.historyCount', { count: publications.length })}
      onClose={onClose}
      widthClassName="w-full sm:w-[min(100%,32rem)]"
    >
      <ul className="flex flex-col gap-2">
        {publications.map((row) => (
          <PublicationHistoryRow key={row.id} row={row} />
        ))}
      </ul>
    </Sheet>
  );
}
