import type { Metadata } from 'next';
import { Geist, Geist_Mono, Press_Start_2P } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const pressStart2P = Press_Start_2P({
  variable: '--font-press-start-2p',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Maxwell Krause | Full-Stack Developer',
  description:
    'Synthwave-coded, full-stack engineered. Portfolio, projects, and Warhammer goodness.',
  openGraph: {
    title: 'Maxwell Krause | Full-Stack Developer',
    description:
      'Synthwave-coded, full-stack engineered. Portfolio, projects, and Warhammer goodness.',
    url: 'https://maxwellk.dev',
    siteName: 'maxwellk.dev',
    images: [
      {
        url: '/og-image.png', // Direct in public folder
        width: 1200,
        height: 630,
        alt: 'Maxwell Krause Portfolio Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maxwell Krause',
    description: 'Check out my synthwave-coded portfolio.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
