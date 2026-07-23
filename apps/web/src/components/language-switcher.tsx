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
      className={clsx('flex flex-wrap gap-1.5', compact ? '' : 'absolute right-6 top-6')}
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
              'rounded border px-2 py-1 text-xs transition-colors',
              isActive
                ? 'border-[var(--color-fg)] bg-[var(--color-surface)] text-[var(--color-fg)]'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]',
            )}
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </nav>
  );
}
