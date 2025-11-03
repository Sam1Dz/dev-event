'use client';

import type { Route } from 'next';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { LightRays } from '@/components/core/light-rays';
import { FooterApp } from '@/components/layout/footer';
import { NavbarApp } from '@/components/layout/navbar';

export function Providers({ children }: React.PropsWithChildren) {
  const router = useRouter();

  return (
    <HeroUIProvider
      locale="en-GB"
      navigate={(path, options) => router.push(path as Route, options)}
      reducedMotion="user"
    >
      <NextThemesProvider attribute="class" defaultTheme="system">
        <LightRaysDecorator />

        <NavbarApp />
        <main>{children}</main>
        <FooterApp />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

function LightRaysDecorator() {
  const { resolvedTheme, systemTheme } = useTheme();

  const theme = resolvedTheme || systemTheme || 'light';
  const raysColor = theme === 'dark' ? '#8cd5b3' : '#1e6a4f';

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
        raysColor={raysColor}
        raysOrigin="top-center-offset"
        raysSpeed={0.5}
      />
    </div>
  );
}
