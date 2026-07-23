import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BigProjects BOS',
  description: 'BigProjects BOS internal operating tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
