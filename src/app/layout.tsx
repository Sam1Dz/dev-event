import '@/frontend/styles/globals.css';

import { Providers } from '@/frontend/components/providers';
import { fontMartianMono, fontSchibstedGrotesk } from '@/frontend/config/fonts';

export { metadata } from '@/frontend/config/site';

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${fontSchibstedGrotesk.variable} ${fontMartianMono.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
