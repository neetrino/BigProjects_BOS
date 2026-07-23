import { getLocale } from 'next-intl/server';
import { SettingsPage } from '@/features/settings/settings-page';
import { resolveLocale } from '@/i18n/config';

export default async function SettingsRoutePage() {
  const currentLocale = resolveLocale(await getLocale());
  return <SettingsPage currentLocale={currentLocale} />;
}
