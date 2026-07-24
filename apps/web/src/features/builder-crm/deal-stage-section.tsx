'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DealListItem, DealStage } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { allowedNextStages } from '@/features/builder-crm/constants';

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

  async function applyStage(stage: DealStage) {
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
      <div className="flex flex-wrap gap-2">
        {nextStages.map((stage) => (
          <Button
            key={stage}
            variant={stage === 'LOST' ? 'danger' : 'secondary'}
            disabled={busy}
            onClick={() => void applyStage(stage)}
          >
            {t(`stage.actions.${stage}`)}
          </Button>
        ))}
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
