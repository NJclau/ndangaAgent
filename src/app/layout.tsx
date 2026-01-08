import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Ndanga Agent',
  description: 'Your intelligent agent for lead discovery and management.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
  },
  themeColor: '#E6E6FA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
