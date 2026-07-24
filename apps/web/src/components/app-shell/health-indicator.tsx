'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchHealth } from '@/lib/api/health';

export function HealthIndicator() {
  const t = useTranslations('health');
  const [label, setLabel] = useState(t('checking'));
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchHealth()
      .then((data) => {
        if (!cancelled) {
          const isOk = data.database === 'up';
          setOk(isOk);
          setLabel(isOk ? t('ok') : t('dbDown'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOk(false);
          setLabel(t('unreachable'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]" title={label}>
      <span
        aria-hidden
        className={
          ok === null
            ? 'size-1.5 rounded-full bg-[var(--color-border-strong)]'
            : ok
              ? 'size-1.5 rounded-full bg-[var(--color-success)]'
              : 'size-1.5 rounded-full bg-[var(--color-danger)]'
        }
      />
      {label}
    </p>
  );
}
