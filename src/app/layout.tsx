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
  title: 'Maxwell Krause | Full-Stack Developer & Software Engineer',
  description:
    'Maxwell Krause (Max Krause) - Full-stack developer and software engineer. Synthwave-coded portfolio featuring React, Next.js, TypeScript, and modern web development. Charleston-based developer with experience at Microsoft, PlaneLogix, Rhinogram, and more.',
  keywords: [
    'Maxwell Krause',
    'Max Krause',
    'full-stack developer',
    'software engineer',
    'web developer',
    'React developer',
    'Next.js developer',
    'TypeScript developer',
    'Charleston developer',
    'South Carolina developer',
    'JavaScript developer',
    'frontend developer',
    'backend developer',
    'maxwellk.dev',
    'synthwave developer',
    'Microsoft TEALS',
    'PlaneLogix',
    'Rhinogram',
    'Roobet',
    'Charleston tech',
  ],
  authors: [{ name: 'Maxwell Krause' }],
  creator: 'Maxwell Krause',
  publisher: 'Maxwell Krause',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Maxwell Krause | Full-Stack Developer & Software Engineer',
    description:
      'Maxwell Krause (Max Krause) - Full-stack developer creating synthwave-coded experiences. Portfolio showcasing modern web development with React, Next.js, and TypeScript.',
    url: 'https://maxwellk.dev',
    siteName: 'Maxwell Krause Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Maxwell Krause - Full-Stack Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maxwell Krause | Full-Stack Developer',
    description:
      'Maxwell Krause (Max Krause) - Check out my synthwave-coded portfolio and projects.',
    images: ['/og-image.png'],
    creator: '@maxwellsmart84',
  },
  alternates: {
    canonical: 'https://maxwellk.dev',
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

// Structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Maxwell Krause',
  alternateName: ['Max Krause', 'Maxwell K.'],
  url: 'https://maxwellk.dev',
  image: 'https://maxwellk.dev/og-image.png',
  sameAs: [
    'https://github.com/maxwellsmart84',
    'https://linkedin.com/in/maxwell-krause',
    'https://twitter.com/maxwellsmart84',
  ],
  jobTitle: 'Full-Stack Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'Freelance',
  },
  knowsAbout: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Full-Stack Development',
    'Web Development',
    'Software Engineering',
    'Frontend Development',
    'Backend Development',
  ],
  alumniOf: {
    '@type': 'Organization',
    name: 'Microsoft TEALS Program',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Charleston',
    addressRegion: 'SC',
    addressCountry: 'US',
  },
  email: 'max@maxwellk.dev',
  description:
    'Full-stack developer and software engineer specializing in modern web technologies. Creator of synthwave-inspired digital experiences.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
