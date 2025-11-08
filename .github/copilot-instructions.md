# AI Coding Agent Instructions for DevEvent

## Project Overview

**DevEvent** is a Next.js 16 full-stack portfolio application—a hub for
discovering and booking developer events. Frontend displays featured events;
backend persists event and booking data in MongoDB with Mongoose ODM.

**Key Stack:**

- **Framework:** Next.js 16 (App Router, React 19, React Compiler enabled)
- **Frontend:** TypeScript, Tailwind CSS v4, HeroUI v2 with next-themes
- **Backend:** Route handlers with standardized REST API responses, MongoDB with
  Mongoose ODM, environment validation via @t3-oss/env-nextjs
- **Language:** TypeScript (strict mode, ES2017 target)
- **Package Manager:** Bun (primary), npm/node v20.9+

## Architecture & File Structure

### Key Patterns

- **Layered architecture:** `src/frontend/` (UI), `src/backend/` (models,
  connection), `src/core/` (shared types, config, constants)
- **Configuration centralization:** `src/core/config/env.ts` validates server
  environment; `src/frontend/config/` contains fonts, site metadata, theme
  config
- **Provider wrapping:** `Providers` component
  (`src/frontend/components/providers.tsx`) applies HeroUIProvider and
  NextThemesProvider with LightRays background
- **Path aliases:** `@/*` resolves to `src/` (configured in `tsconfig.json`)
- **Database connection pooling:** `src/backend/connection.ts` caches MongoDB
  connection for serverless functions

### Essential Files

- `src/app/layout.tsx` — Root layout with font variables, global CSS, Providers
  wrapper
- `src/app/page.tsx` — Homepage displaying featured events
- `src/frontend/components/providers.tsx` — Client-side context providers
  (HeroUI, next-themes) with LightRays background
- `src/frontend/components/layout/navbar.tsx` — Navigation bar with logo and
  login
- `src/frontend/components/layout/footer.tsx` — Site footer with links
- `src/frontend/components/core/event-card.tsx` — Event card component
  displaying event info
- `src/frontend/components/core/light-rays.tsx` — WebGL-based light ray
  animation effect
- `src/frontend/config/site.ts` — Metadata export for Next.js
- `src/frontend/config/fonts.ts` — Google Fonts configuration (Schibsted
  Grotesk, Martian Mono)
- `src/frontend/config/theme/` — HeroUI theme configuration (light/dark modes
  with custom colors)
- `src/core/constants/events.ts` — Event data array with EventType export
- `src/core/types/` — Shared TypeScript types (Event, Booking, MongoDB)
- `src/core/config/env.ts` — Environment validation (@t3-oss/env-nextjs)
- `src/backend/models/event.ts` — Event Mongoose schema with pre-save hooks
- `src/backend/models/booking.ts` — Booking Mongoose schema with referential
  integrity
- `src/backend/connection.ts` — MongoDB connection pooling for serverless

## Developer Workflow

### Common Commands

```bash
bun run dev              # Install dependencies, start dev server (localhost:3000, watch mode)
bun run build            # Install dependencies, auto-fix lint, validate lint, format, build
bun run start            # Run production build locally
bun run format           # Auto-fix lint, format with Prettier, validate lint again
bun run outdated         # Check for outdated dependencies
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

import { Providers } from '@/frontend/components/providers';
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

- **Global CSS:** `src/frontend/styles/globals.css` (included in root layout)
- **Font variables:** CSS variables from `src/frontend/config/fonts.ts` (e.g.,
  `font-sans` uses `--font-schibsted-grotesk`)
- **Tailwind Config:** `src/frontend/config/theme/` exports HeroUI theme with
  light/dark color palettes; index.ts merges both themes
- **Dark mode:** Class-based via next-themes; defaults to system preference with
  `dark:` prefix on Tailwind utilities
- **Custom utilities:** `text-gradient` applies primary-to-foreground gradient
  text; `events-layout` creates responsive 3-column grid
- **Tailwind v4 syntax:** Uses `@import`, `@plugin`, `@source`, `@layer`
  directives

## Backend Architecture

### Database Models

- **Event Model** (`src/backend/models/event.ts`) — Mongoose schema with fields:
  title, slug (unique), description, overview, image, venue, location, date,
  time, mode (online|offline|hybrid), audience, agenda, organizer, tags
- **Booking Model** (`src/backend/models/booking.ts`) — Mongoose schema linking
  events to attendee emails with referential integrity
- **Pre-save hooks:** Event auto-generates slug from title and normalizes
  date/time; Booking validates event existence

### Database Connection

- **Pooling:** `src/backend/connection.ts` caches Mongoose connection globally
  for serverless reuse (prevents multiple simultaneous connections)
- **Environment:** MongoDB URI and database name validated via
  `src/core/config/env.ts` using @t3-oss/env-nextjs
- **Pattern:** Use `withDatabase()` wrapper to ensure connection before handler
  execution

### Type Safety

- **Shared types:** `src/core/types/event.ts` and `src/core/types/booking.ts`
  define Mongoose document interfaces
- **MongoDB types:** `src/core/types/mongodb.ts` exports `MongoEntityId` and
  `MongooseConnection` interface

## API Layer Architecture

### Route Handlers

- **Location:** `src/app/api/[route]/route.ts` — Next.js App Router handlers
- **Pattern:** Use `withDatabase()` wrapper from `src/backend/connection.ts` to
  ensure MongoDB connection before handler execution; prevents multiple
  simultaneous connections in serverless
- **Error Handling:** Wrap handler logic in try-catch; use
  `internalServerError()` helper for unhandled exceptions
- **Type Safety:** Always type request bodies and responses using Zod schemas

### Response Format (Standardized)

All API responses follow a consistent structure. Use helpers from
`src/backend/libs/response.ts`:

**Success Response** (`apiSuccess<T>(code, status, data, detail)`)

```json
{
  "code": "OK",
  "detail": "Event created successfully",
  "data": {
    /* actual data */
  },
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

**Error Response** (`apiError(code, status, errors, type)`)

```json
{
  "type": "client_error",
  "code": "Bad Request",
  "errors": [{ "detail": "Email is required", "attr": "email" }],
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

### Validation Pattern

Use `validateRequest<T>(request, schema)` from `src/backend/libs/validation.ts`
to parse and validate request bodies against Zod schemas. Automatically throws
formatted API error response on validation failure.

Example:

```typescript
const body = await validateRequest(request, EventSchema);
return apiSuccess('OK', 200, body, 'Event created');
```

### HTTP Status Codes

Reference `src/backend/constants/http-status.ts` for all supported HTTP status
codes (200, 201, 400, 401, 404, 500, etc.) with standardized message strings.

## Advanced Features

### LightRays Animation (WebGL)

- **Location:** `src/frontend/components/core/light-rays.tsx` — 600+ line WebGL
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

- **Source:** `src/core/constants/events.ts` — Array of event objects with slug,
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
- **Server-only marker:** Use `'server-only'` in backend modules to prevent
  client bundling

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
- **Mongoose:** ODM for MongoDB; supports pre-save hooks, validation, indexes,
  and referential integrity via refs

## Testing & Debugging

- **Dev Mode:** `bun run dev` enables hot reload with
  `turbopackFileSystemCacheForDev`
- **Linting Issues:** Run `bun run lint` to identify errors; check VSCode
  Problems panel (configured for auto-fix on save)
- **Type Checking:** TypeScript compile errors appear in VSCode diagnostics;
  check `next-env.d.ts` generated types
- **Build Validation:** `bun run build` catches type and lint issues before
  production

## When Adding Features

1. **New page:** Create `.tsx` file under `src/app/[route]/page.tsx`; inherit
   layout + metadata pattern
2. **New component:** Create in `src/frontend/components/`; use
   `React.PropsWithChildren` for reusable wrappers
3. **Configuration:** Add to `src/frontend/config/` if it's app-wide (metadata,
   theme, fonts)
4. **Styling:** Use Tailwind classes inline; reference font variables from
   `src/frontend/config/fonts.ts`
5. **Event data:** Add to `src/core/constants/events.ts` array; type
   automatically inferred via EventType
6. **New backend model:** Create schema in `src/backend/models/`; export type
   interface in `src/core/types/`; use `withDatabase()` wrapper for handlers
7. **Always run:** `bun run format` → `bun run build` before committing

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
