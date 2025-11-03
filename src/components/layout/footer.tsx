import { Link } from '@heroui/react';
import NextImage from 'next/image';

export function FooterApp() {
  return (
    <footer
      aria-label="Site footer"
      className="border-divider/20 border-t px-6 py-12"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-4">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex flex-row items-center gap-1">
            <NextImage
              alt="DevEvent logo"
              height={24}
              src="/logo.png"
              width={24}
            />

            <p className="text-large font-bold italic">DevEvent</p>
          </div>

          <p className="text-tiny text-foreground/60">
            Created by&nbsp;
            <Link
              aria-label="adrianhajdin GitHub profile (opens in new tab)"
              className="text-tiny"
              href="https://github.com/adrianhajdin"
              rel="noopener noreferrer"
              target="_blank"
            >
              adrianhajdin
            </Link>
            , Enhanced by&nbsp;
            <Link
              aria-label="Sam1Dz GitHub profile (opens in new tab)"
              className="text-tiny"
              href="https://github.com/Sam1Dz"
              rel="noopener noreferrer"
              target="_blank"
            >
              Sam1Dz
            </Link>
          </p>
        </div>

        <p className="text-small">
          This project is&nbsp;
          <Link
            aria-label="DevEvent GitHub repository (opens in new tab)"
            href="https://github.com/Sam1Dz/dev-event"
            rel="noopener noreferrer"
            target="_blank"
          >
            open source
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
