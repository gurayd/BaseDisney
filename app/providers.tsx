'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { config as wagmiConfig } from '@/lib/wagmi-config';

type ProvidersProps = {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale?: string;
};

export function Providers({ children, messages, locale = 'en' }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
