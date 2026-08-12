'use client';

import { useTranslations } from 'next-intl';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { SelectInput } from '@/components/ui/field';
import { formatCycleOptionLabel } from '@/components/active-cycle/format-cycle-option-label';

type SidebarCycleSwitcherProps = {
  collapsed: boolean;
};

export function SidebarCycleSwitcher({ collapsed }: SidebarCycleSwitcherProps) {
  const t = useTranslations('nav');
  const { cycles, cycleId, setCycleId, status } = useActiveCycle();

  if (collapsed) {
    return null;
  }

  const disabled = status !== 'ready' || cycles.length === 0;
  const selectValue = cycleId || '';

  return (
    <div className="app-sidebar-cycle mb-3 px-0.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">{t('eventCycle')}</span>
        <SelectInput
          value={selectValue}
          disabled={disabled}
          onChange={(event) => setCycleId(event.target.value)}
          aria-label={t('eventCycle')}
          className="w-full"
        >
          {status === 'loading' ? <option value="">{t('eventCycleLoading')}</option> : null}
          {status === 'error' ? <option value="">{t('eventCycleError')}</option> : null}
          {status === 'ready' && cycles.length === 0 ? (
            <option value="">{t('eventCycleEmpty')}</option>
          ) : null}
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {formatCycleOptionLabel(cycle, t('eventCycleActive'))}
            </option>
          ))}
        </SelectInput>
      </label>
    </div>
  );
}
