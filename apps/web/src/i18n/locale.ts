'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE_NAME, type Locale } from '@/i18n/config';

export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
  });
}
