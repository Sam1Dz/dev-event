'use client';

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@heroui/react';
import NextImage from 'next/image';
import NextLink from 'next/link';

export function NavbarApp() {
  return (
    <Navbar isBlurred aria-label="Main navigation" maxWidth="xl">
      <NavbarBrand>
        <NextLink
          aria-label="DevEvent home"
          className="flex flex-row items-center gap-2"
          href="/"
        >
          <NextImage
            alt="DevEvent logo"
            height={24}
            src="/logo.png"
            width={24}
          />

          <p className="text-xl font-bold italic">DevEvent</p>
        </NextLink>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            aria-label="Navigate to login page"
            as={Link}
            className="text-medium font-medium"
            color="primary"
            radius="full"
          >
            Login
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
