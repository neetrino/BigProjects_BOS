'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { locales, type Locale } from '@/i18n/config';
import { setLocale } from '@/i18n/locale';

const LOCALE_LABELS: Record<Locale, string> = {
  hy: 'Հայերեն',
  ru: 'Русский',
  en: 'English',
};

type LanguageSwitcherProps = {
  currentLocale: Locale;
  compact?: boolean;
};

export function LanguageSwitcher({ currentLocale, compact = false }: LanguageSwitcherProps) {
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(locale: Locale) {
    if (locale === currentLocale || isPending) {
      return;
    }

    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <nav
      aria-label={t('label')}
      className={clsx(
        'inline-flex flex-wrap gap-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white/80 p-1 shadow-sm',
        compact ? 'w-full' : 'absolute right-6 top-6 z-10',
      )}
    >
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            disabled={isPending}
            onClick={() => handleSelect(locale)}
            className={clsx(
              'rounded-[calc(var(--radius-control)-2px)] px-2.5 py-1 text-xs font-semibold transition-all duration-150',
              compact && 'min-w-0 flex-1',
              isActive
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)]',
            )}
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </nav>
  );
}
