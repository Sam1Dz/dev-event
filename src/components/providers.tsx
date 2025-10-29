'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

import { LightRays } from '@/components/core/light-rays';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <HeroUIProvider reducedMotion="user">
      <NextThemesProvider attribute="class" defaultTheme="system">
        <LightRaysDecorator />

        <main>{children}</main>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

function LightRaysDecorator() {
  const { resolvedTheme } = useTheme();

  if (!resolvedTheme) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 top-0 z-[-1] min-h-screen"
      role="presentation"
    >
      <LightRays
        distortion={0.01}
        followMouse={true}
        lightSpread={0.9}
        mouseInfluence={0.02}
        noiseAmount={0.0}
        rayLength={1.4}
        raysColor={resolvedTheme === 'dark' ? '#8cd5b3' : '#1e6a4f'}
        raysOrigin="top-center-offset"
        raysSpeed={0.5}
      />
    </div>
  );
}
