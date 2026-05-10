import type { PropsWithChildren } from 'react';

import { RootProvider } from '~/components/providers/root';
import { martianMono, schibstedGrotesk } from '~/config/font';

import '~/styles/globals.css';

export { metadata } from '~/config/site';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      suppressHydrationWarning
      className={`${schibstedGrotesk.variable} ${martianMono.variable}`}
      lang="en"
    >
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
