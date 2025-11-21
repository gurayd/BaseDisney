import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n';
import { Providers } from '../providers';
import '../globals.css';

const miniappFrame = {
  version: '1',
  imageUrl: 'https://example.com/disney-mint-og.png',
  button: {
    title: 'Mint Disney Avatar',
    action: {
      type: 'launch_frame',
      name: 'Disney Mint',
      url: 'https://example.com',
      splashImageUrl: 'https://example.com/disney-mint-icon.png',
      splashBackgroundColor: '#020617'
    }
  }
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Disney Mint',
    openGraph: {
      title: 'Disney Mint',
      description: 'Turn your Farcaster profile into a Disney-style avatar and mint it on Base.'
    },
    other: {
      'fc:miniapp': JSON.stringify(miniappFrame)
    }
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type RootLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = params;
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
