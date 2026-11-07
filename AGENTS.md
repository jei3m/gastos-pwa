# Agent Guidelines

Budget-tracker PWA as a Vite+ Bun workspace monorepo (`apps/*`). Run commands
from the repo root. Shared lint/format/type-check/task config lives in the root
`vite.config.ts`; the web app keeps its own `apps/web/vite.config.ts` for Vite
plugins/proxy.

## Layout

- `apps/web/` — Vite+ React 19 SPA: React Router v7, TanStack Query v5, Tailwind
  v4, shadcn/Base UI, Better Auth client. Package `@gastos/web`.
- `apps/api/` — Bun + Express 5 REST API over MySQL, Better Auth, Upstash Redis.
  Package `@gastos/api`. No shared code between the two yet.

## Commands

Root (use `vp`, not raw `vite`/`bun`):

- `vp install` — installs the whole workspace with Bun (single root `bun.lock`).
- `vp run dev` — runs `apps/web` + `apps/api` dev servers in parallel
  (web http://localhost:5173, API http://localhost:5000).
  Individual: `vp run dev:web` / `vp run dev:api`; or `vp dev` targets the web app
  (`defaultPackage`).
- `vp check` — format (oxfmt) + lint (oxlint) + typecheck (tsgolint) across both
  apps from one command.
- `vp run typecheck` — recursive `tsc -b` (web) / `bun x tsc --noEmit` (api).
- `vp run build` — recursive build (`apps/api` has no build script, skipped).
- `vp run db:migrate` / `vp run db:routines` — proxied to `apps/api`.
- Pre-commit hook runs `vp staged` → `vp check --fix` on staged files.
- No tests are configured; `vp test` has nothing to run.

The root also defines `dev:api`, `db:*`, etc.; `vp run <name>` runs those scripts.
`apps/api` keeps its own `dev`/`start`/`db:*`/`typecheck` scripts (`@gastos/api`),
and `apps/web` keeps `dev`/`build`/`preview`/`lint`/`typecheck` (`@gastos/web`).

## Local wiring

- Vite dev server proxies `/api` → `http://localhost:5000`
  (`apps/web/vite.config.ts`). Frontend `.env` sets `VITE_API_URL`; when present,
  `lib/api.ts` and the auth client call it directly.
- Backend `.env` keys: `PORT`, `ORIGIN_URL`, `BETTER_AUTH_URL`,
  `BETTER_AUTH_SECRET`, `MYSQL_*`, `GOOGLE_CLIENT_ID/SECRET`,
  `UPSTASH_REDIS_REST_URL/TOKEN`. `.env` files are gitignored.

## Backend notes

- In `api/index.ts`, Better Auth is mounted at `/api/auth` **before**
  `express.json()` (it needs the raw body). Keep that order.
- Modules live in `modules/<name>/` with `<name>.routes.ts`,
  `<name>.controller.ts`, and `<name>.sql.ts`. Routes are mounted under `/api/*`
  with `requireAuth` + `rateLimit`. `requireAuth` sets `req.userID` (global
  Express namespace augmentation in `middleware/auth.middleware.ts`).
- Use `success()`/`fail()` from `utils/response.ts`; JSON shape is
  `{ success, data }` or `{ success:false, message }`.
- No ORM: query builders in `modules/<name>/<name>.sql.ts` return named-parameter
  (`:param`) strings run via `db.query(sql, params)` (mysql2 pool with
  `namedPlaceholders` + `multipleStatements`).
- Writes go through MySQL stored procedures (`CALL manage_*`) and parse the JSON
  `@response` output (`result[1][0].response`); `v_*` views serve reads.
  Schema/procs/views/triggers live in `db/` and are applied by the migration
  script, not the app.
- Imports include the `.ts` extension (`../lib/db.ts`), required by the backend
  tsconfig (`allowImportingTsExtensions`, bundler resolution).

## Frontend notes

- `@/*` resolves to the web app project root (not `src/`).
- Route entry points live in `src/routes/**/<name>.page.tsx` (kebab-case) and
  export `<Name>Page`. Routes are declared in `src/router.tsx` with
  `createBrowserRouter`; do not adopt file-based routing (dots are URL segments
  there).
- URLs are top-level (`/transactions`, `/accounts/:id`); `/pages/*` exists only
  as a legacy redirect.
- Features live in `features/<name>/` as `<name>.interface.ts` (types),
  `<name>.tq.functions.ts` (calls), `<name>.tq.options.ts`
  (`queryOptions`/`infiniteQueryOptions`). Follow this shape for new features.
- Use `apiFetch` from `lib/api.ts`: sends cookies (`credentials:'include'`),
  expects the `{ success, data }` envelope, throws on `success:false`.
- Before writing any JSX, check `components/ui` and `components/custom` for an
  existing component; raw HTML is a last resort (opt out only for semantic
  layout tags like `main`, `section`, `form`, `nav`).
- Zod schemas in `lib/schema/`; forms use react-hook-form.
- UI primitives live in `components/ui` (shadcn on Base UI); add missing ones
  with `npx shadcn@latest add <component>`. **Always use these instead of raw
  HTML** — do not hand-roll equivalents:
  - panels/cards/boxes → `Card` (+ `CardHeader`, `CardTitle`, `CardContent`,
    `CardFooter`) — never `<div className="border-2 rounded-lg">`.
  - user avatars → `Avatar` + `AvatarImage` + `AvatarFallback` — never `<img>`
    or a conditional image/initials `div`.
  - also available: `Button`, `Input`, `Textarea`, `Checkbox`, `Select`,
    `Label`, `Badge`, `Separator`, `Skeleton`, `Dialog`, `Drawer`,
    `AlertDialog`, `Popover`, `Tabs`, `Accordion`, `Calendar`, `Table`,
    `Carousel`, `Chart`, `Toast`.
  - app-level wrappers in `components/custom` (`typography`, `loader`,
    `page-header`, `navbar`, `date-select-card`, `time-picker`,
    `icon-picker`, `custom-alert-dialog`, …) — check here too before writing
    something new.
- Component variants/states come from the primitive's props (`variant`,
  `size`) and `className`; prefer semantic tokens (`bg-card`, `bg-muted`,
  `text-muted-foreground`) over hardcoded colours like `bg-white` or
  `bg-gray-200` so dark mode keeps working.
- Composition overrides: components ship with their own spacing — `Card` is
  `border-2 bg-card flex flex-col gap-2 rounded-xl py-4` (no horizontal
  padding) and `CardContent` adds `px-4`. To build a compact row card, override
  the primitives (`Card className="gap-0 rounded-lg py-0"` +
  `CardContent className="flex items-center justify-between gap-3 px-3 py-2"`)
  rather than dropping back to raw `div`s.
- React Compiler is enabled — don't hand-write `useMemo`/`React.memo`.
- Single package manager: Bun, with one root `bun.lock`. Do not add nested
  lockfiles under `apps/*`.

## Conventions

- SQL: snake_case identifiers; foreign keys `ref_<acronym>_id`; view output
  columns camelCase; views prefixed `v_`; stored procs `manage_*`; `:param`
  binds and `@response` for proc output; UUIDs `CHAR(36)`;
  `DEFAULT CURRENT_TIMESTAMP`.
- TS naming: components & types PascalCase, functions/vars camelCase, constants
  UPPER_SNAKE_CASE; foreign-key fields like `refAccountsID`, `refCategoriesID`.
- Never add comments unless asked.
- Commit prefixes: `feat:`, `fix:`, `chore:`, `del:`, `ref:`. PRs use
  plain-language Features/Fixes/Refactor/Chores sections, omit empty sections,
  and never carry commit prefixes into the description.

## Ponytail

Lazy senior dev mode is always on (adapted from
`DietrichGebert/ponytail`, level `full`). The best code is the code never
written: solve the whole task with the least new code.

- Before writing, read the code the change touches and list every place it must
  reach (callers, exports, fixtures, config). Check what it could break: data it
  would destroy or expose, callers that stop working. That is scope; extra
  features are not.
- Take the first option that fully works: skip what nobody asked for (and name
  it in one line) → reuse an existing helper/component/service the way the
  surrounding code does → platform feature or stdlib → already installed
  dependency → a single readable line → the minimum code that works.
- No abstraction, wrapper, option, config, or "for later" code nobody asked
  for. Deletion beats addition. Keep the existing layers, filenames and feature
  shape. Never add a dependency for a few lines.
- Bug fix: grep every caller of the function first, then fix the root cause once
  in the shared code.
- Lazy code is unfinished without its check. With no test runner configured, a
  branch/loop/parser/money/security change gets an assert-based self-check or a
  stated manual verification; trivial changes need none.
- Never cut: validation at trust boundaries, error handling that prevents data
  loss, security, accessibility, or anything the user asked for.
- The no-comments rule above still wins; if a shortcut has a known limit, say so
  in the reply instead.
- Close each reply with one or two lines: what was skipped or not checked, and
  the risk the user should know.
