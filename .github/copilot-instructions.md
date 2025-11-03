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
- `src/app/page.tsx` — Homepage displaying featured events
- `src/components/providers.tsx` — Client-side context providers (HeroUI,
  next-themes) with LightRays background
- `src/components/layout/navbar.tsx` — Navigation bar with logo and login
- `src/components/layout/footer.tsx` — Site footer with links
- `src/components/core/event-card.tsx` — Event card component displaying event
  info
- `src/components/core/light-rays.tsx` — WebGL-based light ray animation effect
- `src/config/site.ts` — Metadata export for Next.js
- `src/config/fonts.ts` — Google Fonts configuration (Schibsted Grotesk, Martian
  Mono)
- `src/config/theme/` — HeroUI theme configuration (light/dark modes with custom
  colors)
- `src/constants/events.ts` — Event data array with EventType export

## Developer Workflow

### Common Commands

```bash
bun dev              # Install dependencies, start dev server (localhost:3000, watch mode)
bun build            # Install dependencies, auto-fix lint, validate lint, format, build
bun start            # Run production build locally
bun format           # Auto-fix lint, format with Prettier, validate lint again
bun outdated         # Check for outdated dependencies
```

### Code Quality Enforcement

- **On save:** ESLint auto-fix, import organization, and Prettier formatting
  (VSCode settings)
- **Build script:** Runs
  `bun install && eslint --fix . && eslint && prettier --write . && next build`
  in order
- **ESLint rules:** Strict type imports, consistent `no-console` (warn except
  error/warn logs), prop/import ordering, self-closing components
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
- **Tailwind Config:** `src/config/theme/` exports HeroUI theme with light/dark
  color palettes; index.ts merges both themes
- **Dark mode:** Class-based via next-themes; defaults to system preference with
  `dark:` prefix on Tailwind utilities
- **Custom utilities:** `text-gradient` applies primary-to-foreground gradient
  text; `events-layout` creates responsive 3-column grid
- **Tailwind v4 syntax:** Uses `@import`, `@plugin`, `@source`, `@layer`
  directives

## Advanced Features

### LightRays Animation (WebGL)

- **Location:** `src/components/core/light-rays.tsx` — 600+ line WebGL
  background effect
- **Tech:** OGL library with GLSL shaders, Intersection Observer for lazy
  loading
- **Props:** Customizable origin, color, speed, spread, ray length, mouse
  following
- **Integration:** `Providers` component renders LightRaysDecorator that reads
  theme and passes appropriate ray color
- **Performance:** Lazy-loads on visibility; smooth mouse tracking with
  exponential smoothing (92% decay); handles WebGL context loss

### Event Data & Type Safety

- **Source:** `src/constants/events.ts` — Array of event objects with slug,
  image, date, time, location
- **Type export:** `EventType = (typeof events)[number]` — Infers type from data
- **Usage:** `EventCard` destructures EventType props; page maps events to cards
- **Pattern:** Typed route export structure enables autocomplete across
  components

## Integration Points

### Next.js Features

- **Typed Routes:** Enabled (`typedRoutes: true`) — use typed path strings
- **Image Optimization:** Use `next/image` component with `priority` for
  above-fold images
- **Metadata:** Export from layout files or use `generateMetadata` for dynamic
  pages
- **React Compiler:** Enabled for automatic memoization
- **Suppress Hydration Warning:** Applied to html tag in layout for next-themes
  compatibility

### External Libraries

- **HeroUI:** Wrap app in `HeroUIProvider` with `reducedMotion="user"` and
  locale="en-GB"; use built-in components from `@heroui/react`; theme colors
  imported in Providers navigate callback for typed routes
- **next-themes:** Configured for class attribute with system preference
  default; provides `useTheme()` hook in client components; LightRaysDecorator
  uses `resolvedTheme` and `systemTheme` to pick ray color
- **react-icons:** HeroUI2 icon integration using `react-icons/hi2` (HeroIcon v2
  set); used in EventCard, navbar buttons, footer
- **OGL:** WebGL rendering library for light ray animation; includes type
  definitions for Renderer, Mesh, Program, Triangle

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
5. **Event data:** Add to `src/constants/events.ts` array; type automatically
   inferred via EventType
6. **Always run:** `bun format` → `bun lint:fix` → `bun build` before committing

## Critical Gotchas

- **CSS Variables:** Font variables (e.g., `--font-schibsted-grotesk`) must be
  applied to ancestors; Tailwind picks them up via `font-sans`
- **Server vs Client:** Root layout is server component; only wrap children with
  `Providers` client component
- **Import paths:** Use `@/*` aliases; relative imports break when files move
- **Unused variables:** Prefix with `_` if intentionally unused (e.g.,
  `_unused: boolean`)
- **Line width:** Prettier enforces 80 chars; long JSX props break to new lines
- **suppressHydrationWarning:** Required on html tag for next-themes + server
  components compatibility
- **WebGL Context Loss:** LightRays handles WEBGL_lose_context extension for
  proper resource cleanup
