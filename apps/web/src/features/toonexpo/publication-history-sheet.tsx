'use client';

import { useTranslations } from 'next-intl';
import type { VenueMapPublication, VenueMapPublicationStatus } from '@/lib/api/toonexpo';
import { Sheet } from '@/components/ui/sheet';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/format';

type PublicationHistoryRowProps = {
  row: VenueMapPublication;
  versionLabel: string;
  statusLabel: string;
};

type PublicationHistorySheetProps = {
  open: boolean;
  publications: VenueMapPublication[];
  onClose: () => void;
};

function publicationStatusTone(status: VenueMapPublicationStatus): StatusTone {
  switch (status) {
    case 'PUBLISHED':
    case 'ALREADY_PUBLISHED':
      return 'won';
    case 'REJECTED':
    case 'FAILED':
      return 'disabled';
    case 'PENDING':
    default:
      return 'draft';
  }
}

export function PublicationHistoryRow({
  row,
  versionLabel,
  statusLabel,
}: PublicationHistoryRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-2 rounded bg-[var(--color-bg)] px-2 py-1.5 text-xs">
      <span className="font-medium text-[var(--color-fg)]">{versionLabel}</span>
      <StatusBadge label={statusLabel} tone={publicationStatusTone(row.status)} />
      <span className="text-[var(--color-muted)]">{formatDateTime(row.createdAt)}</span>
      {row.status !== 'FAILED' && row.errorMessage ? (
        <span className="w-full text-[var(--color-danger)]">{row.errorMessage}</span>
      ) : null}
    </li>
  );
}

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
      widthClassName="w-full sm:w-[min(100%,30rem)]"
    >
      <ul className="flex flex-col gap-1.5">
        {publications.map((row) => (
          <PublicationHistoryRow
            key={row.id}
            row={row}
            versionLabel={t('publication.version', { version: row.snapshotVersion })}
            statusLabel={t(`publication.status.${row.status}`)}
          />
        ))}
      </ul>
    </Sheet>
  );
}
