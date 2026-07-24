'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DealListItem, DealStage } from '@/lib/api/types';
import { Dialog } from '@/components/ui/dialog';
import { STAGE_SWITCHER_ORDER, allowedNextStages } from '@/features/builder-crm/constants';

type StageChangeOptions = {
  releaseAreas?: boolean;
};

type DealStageSectionProps = {
  deal: DealListItem;
  busy: boolean;
  onStageChange: (stage: DealStage, options?: StageChangeOptions) => Promise<void>;
};

export function DealStageSection({ deal, busy, onStageChange }: DealStageSectionProps) {
  const t = useTranslations('builderSales');
  const tCommon = useTranslations('common');
  const [confirmLost, setConfirmLost] = useState(false);
  const [releaseAreas, setReleaseAreas] = useState(true);
  const nextStages = allowedNextStages(deal.stage);
  const hasAreas = (deal.areas?.length ?? 0) > 0 || deal.areasSummary.count > 0;
  const activeIndex = Math.max(0, STAGE_SWITCHER_ORDER.indexOf(deal.stage));
  const segmentCount = STAGE_SWITCHER_ORDER.length;

  async function applyStage(stage: DealStage) {
    if (busy || stage === deal.stage) {
      return;
    }
    if (!nextStages.includes(stage)) {
      return;
    }
    if (stage === 'LOST') {
      setReleaseAreas(true);
      setConfirmLost(true);
      return;
    }
    await onStageChange(stage);
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('sheet.stage')}</h3>

      <div
        role="group"
        aria-label={t('sheet.stage')}
        className="relative grid w-full grid-cols-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-0.5"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-[10px] bg-[var(--color-surface)] shadow-sm transition-transform duration-300 ease-[var(--ease-out-premium)]"
          style={{
            width: `calc((100% - 4px) / ${segmentCount})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {STAGE_SWITCHER_ORDER.map((stage) => {
          const isCurrent = stage === deal.stage;
          const isAllowed = nextStages.includes(stage);
          const disabled = busy || (!isCurrent && !isAllowed);

          return (
            <button
              key={stage}
              type="button"
              aria-pressed={isCurrent}
              disabled={disabled}
              onClick={() => void applyStage(stage)}
              className={clsx(
                'relative z-[1] truncate rounded-[10px] px-1.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors duration-200',
                isCurrent
                  ? 'text-[var(--color-brand)]'
                  : disabled
                    ? 'text-[var(--color-muted)]/40'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
              )}
            >
              {t(`stages.${stage}`)}
            </button>
          );
        })}
      </div>

      <Dialog
        open={confirmLost}
        title={t('stage.markLostTitle')}
        description={
          hasAreas ? t('stage.markLostWithAreasDescription') : t('stage.markLostDescription')
        }
        confirmLabel={t('stage.actions.LOST')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => {
          void onStageChange('LOST', hasAreas ? { releaseAreas } : undefined).finally(() =>
            setConfirmLost(false),
          );
        }}
        onCancel={() => setConfirmLost(false)}
      >
        {hasAreas ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-fg)]">
            <input
              type="checkbox"
              checked={releaseAreas}
              onChange={(event) => setReleaseAreas(event.target.checked)}
            />
            {t('stage.releaseAreasLabel')}
          </label>
        ) : null}
      </Dialog>
    </section>
  );
}
