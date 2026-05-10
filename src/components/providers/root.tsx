'use client';

import * as React from 'react';

import { ThemeProvider } from './theme';

const composeProviders = (
  ...providers: React.FC<React.PropsWithChildren>[]
): React.FC<React.PropsWithChildren> => {
  return ({ children }: React.PropsWithChildren) => {
    return providers.reduceRight<React.ReactNode>(
      (child, Provider) => <Provider>{child}</Provider>,
      children
    ) as React.ReactElement;
  };
};

function AppThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider enableSystem attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}

export const RootProvider = composeProviders(AppThemeProvider);
