'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { locales, type Locale } from '@/i18n/config';
import { setLocale } from '@/i18n/locale';

const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  ru: 'РУ',
  hy: 'ՀԱՅ',
};

const SLIDE_MS = 320;

type LanguageSwitcherProps = {
  currentLocale: Locale;
  compact?: boolean;
  /** Dark brand surfaces (sidebar). */
  onBrand?: boolean;
};

export function LanguageSwitcher({
  currentLocale,
  compact = false,
  onBrand = false,
}: LanguageSwitcherProps) {
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useState<Locale | null>(null);

  if (optimisticLocale !== null && optimisticLocale === currentLocale) {
    setOptimisticLocale(null);
  }

  const selected = optimisticLocale ?? currentLocale;
  const activeIndex = Math.max(0, locales.indexOf(selected));

  function handleSelect(locale: Locale) {
    if (locale === selected || isPending) {
      return;
    }

    setOptimisticLocale(locale);
    startTransition(() => {
      void (async () => {
        await setLocale(locale);
        router.refresh();
      })();
    });
  }

  return (
    <nav
      aria-label={t('label')}
      className={clsx(
        'relative inline-grid grid-cols-3 rounded-xl border p-0.5',
        compact ? 'w-full' : 'absolute right-6 top-6 z-10',
        onBrand
          ? 'border-white/15 bg-white/10'
          : 'border-[var(--color-border)] bg-[var(--color-bg)]/80',
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[10px]',
          'transition-transform ease-[var(--ease-out-premium)] will-change-transform',
          onBrand ? 'bg-white shadow-sm' : 'bg-[var(--color-surface)] shadow-sm',
        )}
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
          transitionDuration: `${SLIDE_MS}ms`,
        }}
      />

      {locales.map((locale) => {
        const isActive = locale === selected;

        return (
          <button
            key={locale}
            type="button"
            aria-label={LOCALE_SHORT[locale]}
            aria-pressed={isActive}
            disabled={isPending}
            onClick={() => handleSelect(locale)}
            className={clsx(
              'relative z-[1] flex min-w-0 items-center justify-center rounded-[10px] px-2 py-1.5 text-xs font-semibold tracking-wide',
              'transition-colors duration-200 disabled:cursor-wait',
              isActive
                ? 'text-[var(--color-brand)]'
                : onBrand
                  ? 'text-white/70 hover:text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
            )}
          >
            {LOCALE_SHORT[locale]}
          </button>
        );
      })}
    </nav>
  );
}
