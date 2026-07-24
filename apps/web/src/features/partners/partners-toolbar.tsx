'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { EventCycle } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { SearchInput, SelectInput } from '@/components/ui/field';

type StaffOption = {
  id: string;
  name: string;
};

type PartnersToolbarProps = {
  cycles: EventCycle[];
  cycleId: string;
  onCycleChange: (cycleId: string) => void;
  view: BoardViewMode;
  onViewChange: (view: BoardViewMode) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  partnerTypeOptions: string[];
  partnerType: string;
  onPartnerTypeChange: (value: string) => void;
  staffOptions: StaffOption[];
  assignedStaffId: string;
  onAssignedStaffChange: (staffId: string) => void;
  onCreate: () => void;
};

export function PartnersToolbar({
  cycles,
  cycleId,
  onCycleChange,
  view,
  onViewChange,
  searchInput,
  onSearchChange,
  partnerTypeOptions,
  partnerType,
  onPartnerTypeChange,
  staffOptions,
  assignedStaffId,
  onAssignedStaffChange,
  onCreate,
}: PartnersToolbarProps) {
  const t = useTranslations('partners');

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <Button variant="primary" onClick={onCreate}>
          {t('create')}
        </Button>
      </header>

      <div className="toolbar-shell">
        <SelectInput
          className="max-w-[220px]"
          value={cycleId}
          onChange={(event) => onCycleChange(event.target.value)}
          aria-label={t('toolbar.cycle')}
        >
          {cycles.length === 0 ? <option value="">{t('toolbar.noCycles')}</option> : null}
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
              {cycle.status === 'ACTIVE' ? ` (${t('toolbar.active')})` : ''}
            </option>
          ))}
        </SelectInput>

        <div
          role="group"
          aria-label={t('toolbar.view')}
          className="inline-flex rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-0.5"
        >
          <button
            type="button"
            className={clsx(
              'rounded-[calc(var(--radius-control)-2px)] px-2.5 py-1.5 text-xs font-semibold transition-colors',
              view === 'kanban'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
            )}
            onClick={() => onViewChange('kanban')}
          >
            {t('toolbar.kanban')}
          </button>
          <button
            type="button"
            className={clsx(
              'rounded-[calc(var(--radius-control)-2px)] px-2.5 py-1.5 text-xs font-semibold transition-colors',
              view === 'list'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
            )}
            onClick={() => onViewChange('list')}
          >
            {t('toolbar.list')}
          </button>
        </div>

        <SearchInput
          className="max-w-xs"
          placeholder={t('toolbar.searchPlaceholder')}
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={t('toolbar.searchPlaceholder')}
        />

        <SelectInput
          className="max-w-[180px]"
          value={partnerType}
          onChange={(event) => onPartnerTypeChange(event.target.value)}
          aria-label={t('toolbar.partnerTypeFilter')}
        >
          <option value="">{t('toolbar.allPartnerTypes')}</option>
          {partnerTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          className="max-w-[200px]"
          value={assignedStaffId}
          onChange={(event) => onAssignedStaffChange(event.target.value)}
          aria-label={t('toolbar.staffFilter')}
        >
          <option value="">{t('toolbar.allStaff')}</option>
          {staffOptions.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}
