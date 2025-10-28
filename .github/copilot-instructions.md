## Quick context

This is a small Next.js (App Router) site in `src/app` using TypeScript,
Tailwind and Next 16+ features.

- Key files:
- `package.json` — scripts: `dev`, `build`, `start`, `lint`, `lint:fix`,
  `format` (run via `bun run <script>` by default).
- `next.config.ts` — `reactCompiler: true`, `typedRoutes: true`, experimental
  turbopack setting.
- `tsconfig.json` — strict TypeScript, path alias `@/* -> ./src/*`.
- `src/app/layout.tsx` and `src/app/page.tsx` — app router entry and examples of
  font/CSS usage.
- `src/app/globals.css` — Tailwind + CSS variables for theme.
- `eslint.config.mjs` — project lint rules and overrides (note `_`-prefixed
  ignored vars).

## Big-picture architecture

- App router-based Next.js project: pages live in `src/app`. Components default
  to server components.
- Styling: Tailwind + custom CSS variables in `globals.css` (light/dark themes
  handled via :root and media queries).
- Fonts: `next/font/google` used in `layout.tsx` with CSS variable injection
  (see `Geist`/`Geist_Mono` usage).
- TypeScript: strict settings, no emit; import alias `@/...` points to `src/`
  (use `import X from '@/components/X'`).

## Developer flows & useful commands (run in PowerShell / terminal)

- Start dev server: `bun run dev` (runs `next dev`).
- Build for production: `bun run build` then `bun run start` to run the compiled
  app.
- Lint: `bun run lint`. Auto-fix common issues: `bun run lint:fix`.
- Format: `bun run format` (prettier + tailwind plugin is enabled).
- Dependency outdated scan (repo includes `bunx npm-check-updates`):
  `bun run outdated` (this uses `bunx`).

Notes: This repo is set up to use Bun for script execution. Prefer
`bun run <script>` for local workflows. Engines in `package.json` still list
Node (>=20.9.0) and Bun (>=1.2.0); Bun is the recommended runner for
dev/build/script tasks.

## Project-specific conventions (do not invent new ones)

- Import alias: always prefer `@/` to reference files under `src/` (configured
  in `tsconfig.json`).
- ESLint ignores unused vars that begin with `_` — when creating function
  arguments you expect to ignore, prefix with `_`.
- Keep components as server components by default (App Router). Add
  `"use client"` at top of file only when client-side behavior/hooks are needed.
- CSS variables for fonts are injected in `layout.tsx` (e.g.
  `--font-geist-sans`). Use those variables in component styles rather than
  re-importing fonts.
- Follow ESLint `import/order` grouping used in `eslint.config.mjs` (external,
  then `@/**` as internal group).

## Integration points & external deps

- Next 16+, React 19 — use the app router conventions.
- TailwindCSS v4 via `postcss.config.mjs` and `@tailwindcss/postcss` plugin.
- No serverless/backend code in this repo — frontend only; expect static assets
  in `public/`.

## Examples for an AI contributor

- Add a component:
  - Place file in `src/components/MyCard.tsx` and import with
    `import MyCard from '@/components/MyCard'`.
  - If it uses state or effects add `"use client"` at top.

- Reference CSS variables set by layout:
  - `className={styles.someClass} style={{ fontFamily: 'var(--font-geist-sans)' }}`
    or use Tailwind utility classes mixed with the CSS vars.

## What not to change without human confirmation

- `next.config.ts` flags (`reactCompiler`, `typedRoutes`, experimental
  turbopack`) — these affect dev/build behavior.
- `tsconfig.json` paths and strictness — changing can break imports and typing
  assumptions.
- ESLint global ignores and stylistic rules — maintain patterns like `_` prefix
  for ignored args.

## If you need clarification

- I updated/created this file from repo-discovered config. If you want more
  detail about deploy targets (Vercel config, environment variables, or CI
  steps), point me to CI files or tell me the intended platform and I'll extend
  these instructions.

---

If this matches what you expect, I can refine examples or add a short checklist
for PRs (testing/lint/format) next.
