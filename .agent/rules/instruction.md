# DevEvent AI Coding Instructions

## Project Context

- **Stack**: Next.js 16 (App Router), React 19, Bun, Tailwind CSS v4, HeroUI v2,
  MongoDB (Mongoose).
- **Architecture**: Layered structure:
  - `src/frontend/`: UI components, styles, config.
  - `src/backend/`: Mongoose models, DB connection, libs.
  - `src/core/`: Shared types, constants, env validation.
  - `src/app/`: Next.js App Router pages and API handlers.

## Critical Workflows

- **Run Dev**: `bun run dev` (installs deps, starts server).
- **Build**: `bun run build` (runs install -> eslint fix -> prettier -> build).
- **Format**: `bun run format` (eslint fix + prettier).
- **Linting**: Strict rules enabled. Unused vars must be prefixed with `_`.

## Coding Conventions

- **Imports**: Order: Types -> Node -> External -> Internal (`@/*`) -> Relative.
  - Example: `import { Providers } from '@/frontend/components/providers';`
- **Styling**: Use Tailwind v4 inline classes.
  - Dark mode: `dark:` prefix (system preference default).
  - Fonts: Use vars from `src/frontend/config/fonts.ts` (e.g., `font-sans`).
- **Components**:
  - Use `React.PropsWithChildren` for wrappers.
  - Mark client components with `'use client'` (e.g., providers).
  - Use self-closing tags where possible.

## Backend & API

- **DB Connection**: Use `withDatabase()` wrapper in ALL route handlers.
  - File: `src/backend/connection.ts`.
- **API Handlers**:
  - Wrap logic in `try-catch`.
  - Use `validateRequest(req, Schema)` for Zod validation.
  - Return standardized responses via `apiSuccess` / `apiError` helpers
    (`src/backend/libs/response.ts`).
- **Models**: Mongoose schemas in `src/backend/models/`.

## Gotchas

- **Hydration**: `suppressHydrationWarning` is required on `html` tag.
- **Server Components**: Root layout is Server; wrap children in `Providers`
  (Client).
- **Env**: Validated via `@t3-oss/env-nextjs` in `src/core/config/env.ts`.
