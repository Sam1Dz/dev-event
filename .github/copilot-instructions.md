# AI Coding Agent Instructions for DevEvent

## Project Overview

**DevEvent** is a Next.js 16 portfolio application—a hub for discovering
developer events. It uses the App Router with TypeScript, Tailwind CSS v4, and
HeroUI component library with theme support.

**Key Stack:**

- **Framework:** Next.js 16 (App Router, React 19, React Compiler enabled)
- **Styling:** Tailwind CSS v4 with PostCSS, Prettier plugin for class ordering
- **Components:** HeroUI v2 with theme provider
- **Theme:** next-themes (class-based, system preference default)
- **Language:** TypeScript (strict mode, ES2017 target)
- **Package Manager:** Bun (primary), npm/node v20.9+

## Architecture & File Structure

### Key Patterns

- **Configuration centralization:** `src/config/` contains fonts, site metadata,
  and theme config
- **Provider wrapping:** `Providers` component (`src/components/providers.tsx`)
  applies HeroUIProvider and NextThemesProvider
- **Path aliases:** `@/*` resolves to `src/` (configured in `tsconfig.json`)
- **Layout inheritance:** Root layout (`src/app/layout.tsx`) imports global
  styles and providers; exports metadata

### Essential Files

- `src/app/layout.tsx` — Root layout with font variables, global CSS, Providers
  wrapper
- `src/app/page.tsx` — Homepage (currently template)
- `src/components/providers.tsx` — Client-side context providers (HeroUI,
  next-themes)
- `src/config/site.ts` — Metadata export for Next.js
- `src/config/fonts.ts` — Google Fonts configuration with CSS variables

## Developer Workflow

### Common Commands

```bash
bun run dev              # Start dev server (localhost:3000, watch mode)
bun run build            # Production build
bun run start            # Run production build locally
bun run lint             # Run ESLint (flat config via eslint.config.mjs)
bun run lint:fix         # Auto-fix linting issues
bun run format           # Prettier formatting
```

### Code Quality Enforcement

- **On save:** ESLint auto-fix, import organization, and Prettier formatting
  (VSCode settings)
- **ESLint rules:** Strict type imports, consistent `no-console` (warn except
  error/warn logs), prop/import ordering
- **Prettier:** 80-char line width, single quotes, trailing commas, Tailwind
  class sorting
- **TypeScript:** Strict mode enabled; unused vars error (unless prefixed with
  `_`)

## Coding Conventions & Patterns

### Import Organization

Enforce this order (ESLint enforces; Prettier organizes imports):

1. Type imports (`import type { ... }`)
2. Node builtins
3. Object/common imports
4. External packages
5. Internal `@/*` aliases (after external)
6. Parent relative (`../`)
7. Sibling relative (`./`)
8. Index imports

Example:

```typescript
import type { Metadata } from 'next';

import { HeroUIProvider } from '@heroui/react';

import { Providers } from '@/components/providers';
```

### Component Patterns

- **Use Client Components sparingly:** Mark context providers with
  `'use client'` (e.g., `providers.tsx`)
- **Styling:** Inline Tailwind classes; use consistent spacing and layout
  patterns from existing code
- **Props:** Destructure and type with `React.PropsWithChildren` or inline type
  objects
- **Self-closing components:** Enforce with ESLint rule

Example:

```tsx
export function MyComponent({ children }: React.PropsWithChildren) {
  return <div className="flex items-center justify-center">{children}</div>;
}
```

### CSS & Styling

- **Global CSS:** `src/styles/globals.css` (included in root layout)
- **Font variables:** CSS variables from `src/config/fonts.ts` (e.g.,
  `font-sans` uses `--font-schibsted-grotesk`)
- **Tailwind Config:** `src/config/theme.ts` exports HeroUI theme configuration
- **Dark mode:** Class-based via next-themes; defaults to system preference with `dark:` prefix on
  Tailwind utilities

## Integration Points

### Next.js Features

- **Typed Routes:** Enabled (`typedRoutes: true`) — use typed path strings
- **Image Optimization:** Use `next/image` component with `priority` for
  above-fold images
- **Metadata:** Export from layout files or use `generateMetadata` for dynamic
  pages
- **React Compiler:** Enabled for automatic memoization

### External Libraries

- **HeroUI:** Wrap app in `HeroUIProvider` with `reducedMotion="user"`; use
  built-in components from `@heroui/react`
- **next-themes:** Configured for class attribute with system preference default;
  provides `useTheme()` hook in client components

## Testing & Debugging

- **Dev Mode:** `bun dev` enables hot reload with
  `turbopackFileSystemCacheForDev`
- **Linting Issues:** Run `bun lint` to identify errors; check VSCode Problems
  panel (configured for auto-fix on save)
- **Type Checking:** TypeScript compile errors appear in VSCode diagnostics;
  check `next-env.d.ts` generated types
- **Build Validation:** `bun build` catches type and lint issues before
  production

## When Adding Features

1. **New page:** Create `.tsx` file under `src/app/[route]/page.tsx`; inherit
   layout + metadata pattern
2. **New component:** Create in `src/components/`; use `React.PropsWithChildren`
   for reusable wrappers
3. **Configuration:** Add to `src/config/` if it's app-wide (metadata, theme,
   fonts)
4. **Styling:** Use Tailwind classes inline; reference font variables from
   `src/config/fonts.ts`
5. **Always run:** `bun format` → `bun lint:fix` → `bun build` before committing

## Critical Gotchas

- **CSS Variables:** Font variables (e.g., `--font-schibsted-grotesk`) must be
  applied to ancestors; Tailwind picks them up via `font-sans`
- **Server vs Client:** Root layout is server component; only wrap children with
  `Providers` client component
- **Import paths:** Use `@/*` aliases; relative imports break when files move
- **Unused variables:** Prefix with `_` if intentionally unused (e.g.,
  `_unused: boolean`)
- **Line width:** Prettier enforces 80 chars; long JSX props break to new lines
