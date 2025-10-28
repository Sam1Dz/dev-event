'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { LightRays } from '@/components/core/light-rays';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <HeroUIProvider reducedMotion="user">
      <NextThemesProvider attribute="class" defaultTheme="system">
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
          <LightRays
            distortion={0.01}
            followMouse={true}
            lightSpread={0.9}
            mouseInfluence={0.02}
            noiseAmount={0.0}
            rayLength={1.4}
            raysColor="#8cd5b3"
            raysOrigin="top-center-offset"
            raysSpeed={0.5}
          />
        </div>

        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
