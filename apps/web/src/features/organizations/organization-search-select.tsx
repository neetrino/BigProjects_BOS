'use client';

import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Field } from '@/components/ui/field';
import { SearchInput } from '@/components/ui/search-input';
import { listOrganizations } from '@/lib/api/organizations';
import type { OrganizationListItem } from '@/lib/api/types';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

const LIST_MAX_HEIGHT_CLASS = 'max-h-56';

type OrganizationSearchSelectProps = {
  id: string;
  label: string;
  value: OrganizationListItem | null;
  onChange: (organization: OrganizationListItem | null) => void;
  onCreateClick: (suggestedName: string) => void;
};

export function OrganizationSearchSelect({
  id,
  label,
  value,
  onChange,
  onCreateClick,
}: OrganizationSearchSelectProps) {
  const t = useTranslations('organizations.picker');
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState(value?.name ?? '');
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<OrganizationListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    void listOrganizations({ search: query || undefined })
      .then((items) => {
        if (!cancelled) {
          setOptions(items);
          setHighlightedIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const createOptionIndex = options.length;
  const totalOptions = options.length + 1;

  function selectOrganization(organization: OrganizationListItem) {
    onChange(organization);
    setSearch(organization.name);
    setOpen(false);
  }

  function clearSelection() {
    onChange(null);
    setSearch('');
    setOpen(true);
  }

  function handleSearchChange(next: string) {
    setSearch(next);
    if (value && next !== value.name) {
      onChange(null);
    }
    setOpen(true);
  }

  function handleCreate() {
    setOpen(false);
    onCreateClick(search.trim());
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }

    if (!open) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % totalOptions);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + totalOptions) % totalOptions);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex === createOptionIndex) {
        handleCreate();
        return;
      }
      const option = options[highlightedIndex];
      if (option) {
        selectOrganization(option);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      setOpen(false);
    }
  }

  const createLabel = search.trim() ? t('createNamed', { name: search.trim() }) : t('create');

  return (
    <Field label={label} htmlFor={id}>
      <div ref={rootRef} className="relative">
        {value ? (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-fg)]">
              {value.name}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              aria-label={t('clear')}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-fg)]"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <SearchInput
            id={id}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
          />
        )}

        {open && !value ? (
          <ul
            id={listboxId}
            role="listbox"
            className={`absolute z-20 mt-1.5 w-full overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-[var(--shadow-sheet)] ${LIST_MAX_HEIGHT_CLASS}`}
          >
            {options.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-[var(--color-muted)]">{t('noResults')}</li>
            ) : (
              options.map((organization, index) => {
                const active = index === highlightedIndex;
                return (
                  <li key={organization.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`flex w-full px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-fg)]'
                          : 'text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]'
                      }`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectOrganization(organization)}
                    >
                      {organization.name}
                    </button>
                  </li>
                );
              })
            )}
            <li role="presentation" className="border-t border-[var(--color-border)]">
              <button
                type="button"
                role="option"
                aria-selected={highlightedIndex === createOptionIndex}
                className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                  highlightedIndex === createOptionIndex
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-brand)]'
                    : 'text-[var(--color-brand)] hover:bg-[var(--color-accent-soft)]'
                }`}
                onMouseEnter={() => setHighlightedIndex(createOptionIndex)}
                onClick={handleCreate}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{createLabel}</span>
              </button>
            </li>
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
