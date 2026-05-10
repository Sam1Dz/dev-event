<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Development Commands

- `npm run dev` — Start Next.js development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix ESLint issues automatically
- `npm run format` — Format code with Prettier
- `npm test` — Run Vitest test suite with coverage
- Run individual tests: `npm test -- <path-to-test-file>`

## Architecture

### Provider Composition Pattern

The application uses a composable provider architecture. All app-level providers are combined into a single `RootProvider` component using the `composeProviders` utility. This pattern allows easy addition of new providers (auth, query client, etc.) without nesting components manually. Add new providers to the `composeProviders` call in [src/components/providers/root.tsx](src/components/providers/root.tsx).

### Path Aliases

- `~/*` maps to `./src/*` — Use this for all internal imports
- Example: `import { foo } from '~/components/bar'`

### Project Structure

- [src/app/](src/app/) — Next.js App Router pages and layouts
- [src/components/](src/components/) — Reusable React components
  - [src/components/providers/](src/components/providers/) — App-level context providers
- [src/config/](src/config/) — Configuration files (site metadata, fonts)
- [src/styles/](src/styles/) — Global styles and Tailwind CSS
- [**test**/](__test__) — Test files mirroring the source structure

### Testing

- Tests mirror source structure in `__test__/` directory
- Vitest with jsdom environment and React Testing Library
- Coverage excludes `src/app/**/*` (Next.js pages) from reports
- Test setup includes automatic cleanup after each test
- Mock modules using `vi.mock()` in test files

### Styling

- Tailwind CSS 4.x with custom design tokens in [src/styles/globals.css](src/styles/globals.css)
- HeroUI component library for UI components
- Custom CSS variables for theming (light/dark modes)
- Font loading handled through Next.js font optimization in [src/config/font.ts](src/config/font.ts)

### Code Quality

- ESLint enforces TSDoc syntax on all TypeScript files
- Imports must be type-imported where possible (`import type { X }`)
- Import order is enforced: types, builtins, externals, internals
- React Compiler is enabled — rely on automatic optimizations
- Prettier with Tailwind plugin for consistent formatting

## Important Notes

### Next.js Version

This project uses Next.js 16.x which may have breaking changes from previous versions. Always check `node_modules/next/dist/docs/` for current APIs and conventions before making changes.

### TSDoc Requirements

All TypeScript/React files must have valid TSDoc comments. The `tsdoc/syntax` ESLint rule is enforced.

### Coverage Configuration

Test coverage excludes the `src/app/**/*` directory. Focus testing efforts on components, utilities, and business logic rather than Next.js pages.

### Provider Composition

When adding new app-level providers:

1. Create the provider component in [src/components/providers/](src/components/providers/)
2. Add it to the `composeProviders` call in [src/components/providers/root.tsx](src/components/providers/root.tsx)
3. Update tests to mock the new provider appropriately
