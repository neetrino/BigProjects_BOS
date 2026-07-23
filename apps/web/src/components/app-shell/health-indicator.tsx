'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchHealth } from '@/lib/api/health';

export function HealthIndicator() {
  const t = useTranslations('health');
  const [label, setLabel] = useState(t('checking'));

  useEffect(() => {
    let cancelled = false;

    void fetchHealth()
      .then((data) => {
        if (!cancelled) {
          setLabel(data.database === 'up' ? t('ok') : t('dbDown'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLabel(t('unreachable'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <p className="text-[11px] text-[var(--color-muted)]" title={label}>
      {label}
    </p>
  );
}
