'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActiveCycle } from '@/components/active-cycle/active-cycle-provider';
import { formatCycleOptionLabel } from '@/components/active-cycle/format-cycle-option-label';
import { SelectInput } from '@/components/ui/field';

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
  const selectedCycle = cycles.find((cycle) => cycle.id === cycleId) ?? null;
  const isActive = selectedCycle?.status === 'ACTIVE';

  return (
    <div className="app-sidebar-cycle mb-4">
      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between gap-2 px-0.5">
          <span className="app-sidebar-cycle-label">{t('eventCycle')}</span>
          {isActive ? (
            <span className="app-sidebar-cycle-badge">{t('eventCycleActive')}</span>
          ) : null}
        </span>

        <span className="app-sidebar-cycle-control">
          <span className="app-sidebar-cycle-icon" aria-hidden>
            <CalendarDays className="size-4" />
          </span>
          <SelectInput
            value={selectValue}
            disabled={disabled}
            onChange={(event) => setCycleId(event.target.value)}
            aria-label={t('eventCycle')}
            variant="onBrand"
            menuMatchTriggerWidth
            pinSelectedToTop
            className="app-sidebar-cycle-select w-full"
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
        </span>
      </label>

      <div
        aria-hidden
        className="mx-0.5 mt-4 h-px bg-gradient-to-r from-white/35 via-white/15 to-transparent"
      />
    </div>
  );
}
