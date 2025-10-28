'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <HeroUIProvider reducedMotion="user">
      <NextThemesProvider attribute="class" defaultTheme="system">
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
