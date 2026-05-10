'use client';

import type { FC, PropsWithChildren, ReactNode } from 'react';

import { ThemeProvider } from './theme';

/**
 * Composes multiple React providers into a single provider component.
 *
 * @remarks
 * Utility function that combines multiple context providers into one
 * nested provider hierarchy. Uses reduceRight to ensure providers are
 * applied in the correct order (first provider wraps all others).
 *
 * @example
 * ```tsx
 * const CombinedProvider = composeProviders(
 *   ThemeProvider,
 *   AuthProvider,
 *   QueryProvider
 * );
 * // Usage: <CombinedProvider><App /></CombinedProvider>
 * ```
 *
 * @param providers - Array of React component providers to compose.
 * @returns A single provider component that nests all input providers.
 */
const composeProviders = (...providers: FC<PropsWithChildren>[]): FC<PropsWithChildren> => {
  return ({ children }: PropsWithChildren) => {
    return providers.reduceRight<ReactNode>(
      (child, Provider) => <Provider>{child}</Provider>,
      children
    );
  };
};

/**
 * Application theme provider configuration.
 *
 * @remarks
 * Configures the Next.js theme provider with sensible defaults:
 * - Enables system theme detection
 * - Uses class attribute for theme application
 * - Defaults to system preference
 *
 * @example
 * ```tsx
 * <AppThemeProvider>
 *   <PageContent />
 * </AppThemeProvider>
 * ```
 *
 * @param children - Child components to receive theme context.
 * @returns The themed children wrapper.
 */
function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider enableSystem attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}

/**
 * Root application provider combining all app-level providers.
 *
 * @remarks
 * Single provider that composes all application-level context providers.
 * Currently includes theme provider with plans to expand for auth,
 * query client, and other global state. Wrap your app root with this provider.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <RootProvider>{children}</RootProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const RootProvider = composeProviders(AppThemeProvider);
