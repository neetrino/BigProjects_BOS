'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listContacts } from '@/lib/api/organizations';
import type { ContactListItem } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { OrganizationDetailSheet } from '@/features/organizations/organization-detail-sheet';
import { ContactsBoard } from '@/features/organizations/contacts-board';
import { ContactsList } from '@/features/organizations/contacts-list';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { SearchInput } from '@/components/ui/field';
import { ViewModeSwitcher } from '@/components/ui/view-mode-switcher';
import { useClientCachedState } from '@/hooks/use-client-cached-state';
import { CLIENT_CACHE_KEYS } from '@/lib/client-cache';

const SEARCH_DEBOUNCE_MS = 300;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: ContactListItem[] };

export function ContactsPage() {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const [view, setView] = useState<BoardViewMode>('kanban');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadState, setLoadState] = useClientCachedState<LoadState>(CLIENT_CACHE_KEYS.contacts, {
    status: 'loading',
  });
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    void listContacts({ search: search || undefined })
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
  }, [search, reloadToken, setLoadState, tCommon]);

  const items = loadState.status === 'ready' ? loadState.items : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="shrink-0">
        <h1 className="page-heading">{t('contactsPage.title')}</h1>
        <p className="page-subtitle">{t('contactsPage.subtitle')}</p>
      </header>

      <div className="toolbar-shell shrink-0">
        <SearchInput
          className="toolbar-search"
          placeholder={t('contactsPage.searchPlaceholder')}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label={t('contactsPage.searchPlaceholder')}
        />
        <ViewModeSwitcher
          className="ml-auto shrink-0"
          value={view}
          onChange={setView}
          boardIcon="grid"
          kanbanLabel={t('toolbar.kanban')}
          listLabel={t('toolbar.list')}
        />
      </div>

      {loadState.status === 'loading' ? <LoadingState message={tCommon('loading')} /> : null}
      {loadState.status === 'error' ? <ErrorState message={loadState.message} /> : null}
      {loadState.status === 'ready' && items.length === 0 ? (
        <EmptyState message={t('contactsPage.empty')} />
      ) : null}

      {loadState.status === 'ready' && items.length > 0 && view === 'kanban' ? (
        <ContactsBoard contacts={items} onOpenOrganization={setSelectedOrganizationId} />
      ) : null}

      {loadState.status === 'ready' && items.length > 0 && view === 'list' ? (
        <ContactsList contacts={items} onOpenOrganization={setSelectedOrganizationId} />
      ) : null}

      <OrganizationDetailSheet
        open={selectedOrganizationId !== null}
        organizationId={selectedOrganizationId}
        onClose={() => setSelectedOrganizationId(null)}
        onUpdated={() => setReloadToken((value) => value + 1)}
      />
    </div>
  );
}
