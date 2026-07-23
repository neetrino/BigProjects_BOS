export const locales = ['en', 'ru', 'hy'] as const;

export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE_NAME = 'locale';

const FALLBACK_DEFAULT_LOCALE: Locale = 'en';

export function getDefaultLocale(): Locale {
  const envLocale = process.env.DEFAULT_LOCALE;
  if (envLocale && isLocale(envLocale)) {
    return envLocale;
  }

  return FALLBACK_DEFAULT_LOCALE;
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value: string | undefined): Locale {
  if (value && isLocale(value)) {
    return value;
  }

  return getDefaultLocale();
}
