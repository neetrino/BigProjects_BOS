import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Armenian, Noto_Serif } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-armenian',
  display: 'swap',
});

const notoSerif = Noto_Serif({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BigProjects BOS',
  description: 'BigProjects BOS internal operating tool',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSans.variable} ${notoSansArmenian.variable} ${notoSerif.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
