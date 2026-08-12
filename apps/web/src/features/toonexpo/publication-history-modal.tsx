'use client';

import { useTranslations } from 'next-intl';
import type { VenueMapPublication, VenueMapPublicationStatus } from '@/lib/api/toonexpo';
import { Button } from '@/components/ui/button';
import { ModalFrame } from '@/components/ui/modal-frame';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/format';

type PublicationHistoryRowProps = {
  row: VenueMapPublication;
  versionLabel: string;
  statusLabel: string;
};

type PublicationHistoryModalProps = {
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
      {row.errorMessage ? (
        <span className="w-full text-[var(--color-danger)]">{row.errorMessage}</span>
      ) : null}
    </li>
  );
}

export function PublicationHistoryModal({
  open,
  publications,
  onClose,
}: PublicationHistoryModalProps) {
  const t = useTranslations('toonexpo');
  const tCommon = useTranslations('common');

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      labelledBy="publication-history-title"
      panelClassName="flex max-h-[80vh] max-w-lg flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lift)]"
    >
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2
          id="publication-history-title"
          className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]"
        >
          {t('publication.historyModalTitle')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {t('publication.historyCount', { count: publications.length })}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
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
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <Button variant="secondary" onClick={onClose}>
          {tCommon('cancel')}
        </Button>
      </div>
    </ModalFrame>
  );
}
