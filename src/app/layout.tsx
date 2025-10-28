import '../styles/globals.css';

import { Providers } from '@/components/providers';
import { fontMartianMono, fontSchibstedGrotesk } from '@/config/fonts';

export { metadata } from '@/config/site';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSchibstedGrotesk.variable} ${fontMartianMono.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
