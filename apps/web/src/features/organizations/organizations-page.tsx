'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listOrganizations } from '@/lib/api/organizations';
import type { OrganizationListItem, OrganizationType } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { OrganizationBoard } from '@/features/organizations/organization-board';
import { OrganizationDetailSheet } from '@/features/organizations/organization-detail-sheet';
import { OrganizationFormSheet } from '@/features/organizations/organization-form-sheet';
import { OrganizationList } from '@/features/organizations/organization-list';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { SearchInput, SelectInput } from '@/components/ui/field';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';

const SEARCH_DEBOUNCE_MS = 300;
const ORGANIZATION_TYPES: OrganizationType[] = ['BUILDER', 'BANK', 'PARTNER', 'OTHER'];

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: OrganizationListItem[] };

export function OrganizationsPage() {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    void listOrganizations({
      search: search || undefined,
      type: typeFilter || undefined,
    })
      .then((items) => {
        if (!cancelled) {
          setLoadState({ status: 'ready', items });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: 'error',
            message: err instanceof ApiError ? err.message : tCommon('unexpectedError'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, typeFilter, reloadToken, tCommon]);

  function reload() {
    setLoadState({ status: 'loading' });
    setReloadToken((value) => value + 1);
  }

  const items = loadState.status === 'ready' ? loadState.items : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="shrink-0">
        <h1 className="page-heading">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>
      </header>

      <div className="toolbar-shell shrink-0">
        <SearchInput
          className="min-w-[12rem] flex-1"
          placeholder={t('searchPlaceholder')}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label={t('searchPlaceholder')}
        />
        <SelectInput
          fitContent
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as OrganizationType | '')}
          aria-label={t('typeFilter')}
        >
          <option value="">{t('allTypes')}</option>
          {ORGANIZATION_TYPES.map((item) => (
            <option key={item} value={item}>
              {t(`types.${item}`)}
            </option>
          ))}
        </SelectInput>
        <ViewModeSwitcher
          className="ml-auto shrink-0"
          value={view}
          onChange={setView}
          boardIcon="grid"
          kanbanLabel={t('toolbar.kanban')}
          listLabel={t('toolbar.list')}
        />
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Button>
      </div>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && items.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : null}

      {loadState.status === 'ready' && items.length > 0 && view === 'kanban' ? (
        <OrganizationBoard organizations={items} onOpen={setSelectedId} />
      ) : null}

      {loadState.status === 'ready' && items.length > 0 && view === 'list' ? (
        <OrganizationList organizations={items} onOpen={setSelectedId} />
      ) : null}

      <OrganizationFormSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
      />

      <OrganizationDetailSheet
        open={selectedId !== null}
        organizationId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={reload}
      />
    </div>
  );
}
