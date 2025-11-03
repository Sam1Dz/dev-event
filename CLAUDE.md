# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**DevEvent** is a Next.js 16 portfolio application showcasing developer events.
It uses the App Router with TypeScript, Tailwind CSS v4, and HeroUI component
library with theme support.

**Tech Stack:**

- **Framework:** Next.js 16 (App Router, React 19, React Compiler enabled)
- **Styling:** Tailwind CSS v4 with PostCSS, Prettier plugin for class ordering
- **Components:** HeroUI v2 with theme provider
- **Theme:** next-themes (class-based, system preference default)
- **Language:** TypeScript (strict mode)
- **Package Manager:** Bun (primary), npm/node v20.9+

## Development Commands

```bash
bun run dev              # Install dependencies, start dev server (localhost:3000, watch mode)
bun run build            # Install dependencies, auto-fix lint, validate lint, format, build
bun run start            # Run production build locally
bun run format           # Auto-fix lint, format with Prettier, validate lint again
bun run outdated         # Check for outdated dependencies
```

## Architecture & File Structure

### Key Patterns

- **Configuration centralization:** `src/config/` contains fonts, site metadata,
  and theme config
- **Provider wrapping:** `Providers` component (`src/components/providers.tsx`)
  applies HeroUIProvider and NextThemesProvider
- **Path aliases:** `@/*` resolves to `src/` (configured in `tsconfig.json`)
- **Layout inheritance:** Root layout (`src/app/layout.tsx`) imports global
  styles and providers; exports metadata

### Core Components

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
  (600+ lines)
- `src/config/site.ts` — Metadata export for Next.js
- `src/config/fonts.ts` — Google Fonts configuration (Schibsted Grotesk, Martian
  Mono)
- `src/config/theme/` — HeroUI theme configuration (light/dark modes with custom
  colors)
- `src/constants/events.ts` — Event data array with EventType export

## Code Quality & Standards

### Import Organization (Enforced by ESLint)

1. Type imports (`import type { ... }`)
2. Node builtins
3. Object/common imports
4. External packages
5. Internal `@/*` aliases
6. Parent relative (`../`)
7. Sibling relative (`./`)
8. Index imports

### Component Patterns

- **Use Client Components sparingly:** Mark context providers with
  `'use client'` (e.g., `providers.tsx`)
- **Styling:** Inline Tailwind classes; use consistent spacing and layout
  patterns
- **Props:** Destructure and type with `React.PropsWithChildren` or inline type
  objects
- **Self-closing components:** Enforced with ESLint rule

### Build Process

The build script runs in this specific order:

1. `bun install` - Install dependencies
2. `eslint --fix .` - Auto-fix linting issues
3. `eslint` - Validate linting passes
4. `prettier --write .` - Format code
5. `next build` - Build production application

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
  exponential smoothing (92% decay)

### Event Data & Type Safety

- **Source:** `src/constants/events.ts` — Array of event objects with slug,
  image, date, time, location
- **Type export:** `EventType = (typeof events)[number]` — Infers type from data
- **Usage:** `EventCard` destructures EventType props; page maps events to cards

## Critical Gotchas

- **CSS Variables:** Font variables (e.g., `--font-schibsted-grotesk`) must be
  applied to ancestors
- **Server vs Client:** Root layout is server component; only wrap children with
  `Providers` client component
- **Import paths:** Use `@/*` aliases; relative imports break when files move
- **suppressHydrationWarning:** Required on html tag for next-themes + server
  components compatibility
- **WebGL Context Loss:** LightRays handles WEBGL_lose_context extension for
  proper resource cleanup
