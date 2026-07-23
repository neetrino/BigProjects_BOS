'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PartnerListItem, PartnerStage } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { allowedNextStages, stageTone } from '@/features/partners/constants';

type PartnerStageSectionProps = {
  partner: PartnerListItem;
  busy: boolean;
  onStageChange: (stage: PartnerStage) => Promise<void>;
};

export function PartnerStageSection({
  partner,
  busy,
  onStageChange,
}: PartnerStageSectionProps) {
  const t = useTranslations('partners');
  const tCommon = useTranslations('common');
  const [confirmDecline, setConfirmDecline] = useState(false);
  const nextStages = allowedNextStages(partner.stage);

  async function applyStage(stage: PartnerStage) {
    if (stage === 'DECLINED') {
      setConfirmDecline(true);
      return;
    }
    await onStageChange(stage);
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('sheet.stage')}</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-muted)]">{t('stage.current')}</span>
        <StatusBadge label={t(`stages.${partner.stage}`)} tone={stageTone(partner.stage)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {nextStages.map((stage) => (
          <Button
            key={stage}
            variant={stage === 'DECLINED' ? 'danger' : 'secondary'}
            disabled={busy}
            onClick={() => void applyStage(stage)}
          >
            {t(`stage.actions.${stage}`)}
          </Button>
        ))}
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
