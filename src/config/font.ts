import { Martian_Mono, Schibsted_Grotesk } from 'next/font/google';

const schibstedGrotesk = Schibsted_Grotesk({
  variable: '--font-schibsted-grotesk',
  subsets: ['latin'],
});

const martianMono = Martian_Mono({
  variable: '--font-martian-mono',
  subsets: ['latin'],
});

export { martianMono, schibstedGrotesk };
