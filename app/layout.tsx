import type { Metadata } from 'next';
import { JetBrains_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/shared/Nav';

const display = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://datacenter.observer'),
  title: {
    default: 'datacenter.observer — Civic Intelligence for AI Infrastructure',
    template: '%s — datacenter.observer',
  },
  description:
    'Track AI data centers being built near you. Find your elected officials. Follow the money. Make your voice heard.',
  openGraph: {
    title: 'datacenter.observer',
    description: 'Track AI data centers. Find officials. Follow the money.',
    type: 'website',
    siteName: 'datacenter.observer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'datacenter.observer',
    description: 'Track AI data centers. Find officials. Follow the money.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-bg-primary text-slate-100 font-body antialiased min-h-screen">
        <Nav />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
