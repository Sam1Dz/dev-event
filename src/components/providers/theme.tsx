'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

/**
 * Theme provider wrapper for next-themes integration.
 *
 * @remarks
 * Provides theme context to the application using next-themes.
 * Supports light/dark/system themes with automatic class attribute
 * updates. Must be used in Client Components.
 *
 * @example
 * ```tsx
 * <ThemeProvider attribute="class" defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @param props - Props forwarded to next-themes ThemeProvider.
 * @returns The themed provider component.
 */
function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}

export { ThemeProvider };
