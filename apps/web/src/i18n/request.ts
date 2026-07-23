import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  LOCALE_COOKIE_NAME,
  resolveLocale,
  type Locale,
} from '@/i18n/config';

async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'ru':
      return (await import('@/messages/ru.json')).default;
    case 'hy':
      return (await import('@/messages/hy.json')).default;
    default:
      return (await import('@/messages/en.json')).default;
  }
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
