// ============================================================================
// Root Layout - Next.js 16.1+
// ============================================================================

export const metadata = {
  title: 'DEGENDLE - Daily Crypto Guessing Game',
  description: 'Guess the crypto term from the hint. New puzzle daily!',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
