// ============================================================================
// Root Layout - Next.js 16.1+
// Enhanced with OG meta tags for social sharing
// ============================================================================

export const metadata = {
  title: 'DEGENDLE - Daily Crypto Guessing Game',
  description: 'Guess the crypto personality, memecoin, or NFT project from the hint. New puzzle daily at 00:00 UTC!',
  keywords: 'crypto, guessing game, wordle, daily puzzle, cryptocurrency, memecoin, nft, web3',
  authors: [{ name: 'vldtz x claude' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#2d4a47',
  openGraph: {
    title: 'DEGENDLE - Daily Crypto Guessing Game',
    description: 'Can you guess today\'s crypto term? New puzzle daily!',
    url: 'https://degendle.com',
    siteName: 'DEGENDLE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DEGENDLE - Daily Crypto Guessing Game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEGENDLE - Daily Crypto Guessing Game',
    description: 'Can you guess today\'s crypto term? New puzzle daily!',
    site: '@degendle',
    creator: '@degendle',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ margin: 0, padding: 0, overscrollBehavior: 'none' }}>
        {children}
      </body>
    </html>
  );
}
