'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PartnerListItem, PartnerStage } from '@/lib/api/types';
import { Dialog } from '@/components/ui/dialog';
import { STAGE_SWITCHER_ORDER, allowedNextStages } from '@/features/partners/constants';

type PartnerStageSectionProps = {
  partner: PartnerListItem;
  busy: boolean;
  onStageChange: (stage: PartnerStage) => Promise<void>;
};

export function PartnerStageSection({ partner, busy, onStageChange }: PartnerStageSectionProps) {
  const t = useTranslations('partners');
  const tCommon = useTranslations('common');
  const [confirmDecline, setConfirmDecline] = useState(false);
  const nextStages = allowedNextStages(partner.stage);
  const activeIndex = Math.max(0, STAGE_SWITCHER_ORDER.indexOf(partner.stage));
  const segmentCount = STAGE_SWITCHER_ORDER.length;

  async function applyStage(stage: PartnerStage) {
    if (busy || stage === partner.stage) {
      return;
    }
    if (!nextStages.includes(stage)) {
      return;
    }
    if (stage === 'DECLINED') {
      setConfirmDecline(true);
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
        className="relative grid w-full grid-cols-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-0.5"
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
          const isCurrent = stage === partner.stage;
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
                'relative z-[1] truncate rounded-[10px] px-1.5 py-2 text-center text-[12px] font-semibold leading-tight transition-colors duration-200',
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
        open={confirmDecline}
        title={t('stage.markDeclinedTitle')}
        description={t('stage.markDeclinedDescription')}
        confirmLabel={t('stage.actions.DECLINED')}
        cancelLabel={tCommon('cancel')}
        confirmVariant="danger"
        busy={busy}
        onConfirm={() => {
          void onStageChange('DECLINED').finally(() => setConfirmDecline(false));
        }}
        onCancel={() => setConfirmDecline(false)}
      />
    </section>
  );
}
