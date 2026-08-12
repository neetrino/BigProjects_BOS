'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BoardViewMode } from '@/features/builder-crm/constants';
import { Button } from '@/components/ui/button';
import { SearchInput, SelectInput } from '@/components/ui/field';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';

type StaffOption = {
  id: string;
  name: string;
};

type BuilderSalesToolbarProps = {
  view: BoardViewMode;
  onViewChange: (view: BoardViewMode) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  staffOptions: StaffOption[];
  assignedStaffId: string;
  onAssignedStaffChange: (staffId: string) => void;
  onCreate: () => void;
};

export function BuilderSalesToolbar({
  view,
  onViewChange,
  searchInput,
  onSearchChange,
  staffOptions,
  assignedStaffId,
  onAssignedStaffChange,
  onCreate,
}: BuilderSalesToolbarProps) {
  const t = useTranslations('builderSales');

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="page-heading">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </header>

      <div className="toolbar-shell">
        <SearchInput
          className="toolbar-search"
          placeholder={t('toolbar.searchPlaceholder')}
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={t('toolbar.searchPlaceholder')}
        />

        <SelectInput
          fitContent
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

        <ViewModeSwitcher
          value={view}
          onChange={onViewChange}
          ariaLabel={t('toolbar.view')}
          kanbanLabel={t('toolbar.kanban')}
          listLabel={t('toolbar.list')}
        />

        <Button variant="primary" onClick={onCreate} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Button>
      </div>
    </div>
  );
}
