# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` boots the app and renders `src/App.tsx`.
- `src/pages/` contains route-level screens (`Home`, `Simulator`, `Exercises`, `Content`).
- `src/components/` holds reusable UI, grouped by domain (`automaton/`, `ui/`, `layout/`).
- `src/simulation/` contains the simulation engine, shared types, and strategy implementations.
- `src/utils/` contains pure logic (including `src/utils/conversions/` algorithms).
- `src/hooks/`, `src/constants/`, `src/data/`, and `src/types/` store shared state logic, constants, content, and types.
- Tests are colocated as `*.test.ts` or `*.test.tsx`; shared setup lives in `src/test/`.
- Static files are in `public/` and `src/assets/`; `dist/` is generated output.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server with HMR.
- `npm run build`: run `tsc -b` then create a production build.
- `npm run preview`: serve the built app locally.
- `npm run lint`: run ESLint across the project.
- `npm run test`: run Vitest once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run test:coverage`: generate text and HTML coverage reports.

## Coding Style & Naming Conventions
- Use TypeScript and React functional components.
- Follow rules in `eslint.config.js`; lint before opening a PR.
- Prefer explicit types and keep strict-mode compatibility.
- User-facing copy standard: write all site texts in Brazilian Portuguese (`pt-BR`), following ABNT2 conventions, and save text files as UTF-8 to avoid accent/encoding regressions.
- Naming conventions:
  - Components: `PascalCase.tsx` (example: `AutomatonEditor.tsx`)
  - Hooks: `useX.ts` / `useX.tsx`
  - Utilities/modules: `camelCase.ts`
  - Tests: `*.test.ts` / `*.test.tsx`
- Keep formatting consistent with the file you edit (current files use mixed 2- and 4-space indentation).

## Testing Guidelines
- Test stack: Vitest + Testing Library with `jsdom`.
- Global setup is in `src/test/setup.ts`; reusable fixtures are in `src/test/fixtures.ts`.
- Add or update colocated tests for behavior changes.
- Prioritize test coverage for logic-heavy changes in `src/utils/**` and `src/simulation/**`.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects; conventional prefixes like `feat:`, `fix:`, `refactor:`, and `style:` are recommended.
- Keep each commit scoped to one logical change.
- PRs should include:
  - A clear summary of what changed and why
  - Validation steps/results (`npm run lint`, `npm run test`, manual checks)
  - Screenshots or short GIFs for visible UI changes
  - Related issue/task references when available
