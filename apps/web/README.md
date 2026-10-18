# React Boilerplate

A modern React + TypeScript single-page application boilerplate built with Vite, Tailwind CSS v4, React Router v7, and TanStack Query.

## Features

- **Vite 8** — fast dev server with HMR and Rolldown-powered builds.
- **React 19** — latest React with the **React Compiler** enabled (automatic memoization).
- **TypeScript (strict)** — type-safe codebase with `verbatimModuleSyntax` and unused-local checks.
- **Tailwind CSS v4** — utility-first styling via the `@tailwindcss/vite` plugin (no config file needed).
- **shadcn / Base UI** — accessible, unstyled-primitive components in `components/ui` (`@base-ui/react`), ready to copy and customize.
- **React Router v7** — client-side routing.
- **TanStack Query v5** — server-state management with built-in devtools.
- **Path aliases** — `@/*` resolves to the project root.

## Tech Stack

| Area        | Library                |
| ----------- | ---------------------- |
| Framework   | React 19 + TypeScript  |
| Build tool  | Vite 8                 |
| Styling     | Tailwind CSS v4        |
| Components  | shadcn (Base UI)       |
| Routing     | React Router v7        |
| Data fetch  | TanStack Query v5      |
| Lint/Format | ESLint 10 + Prettier 3 |

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- A package manager: `npm`, `pnpm`, or `bun`

### Install

```bash
npm install
# or
bun install
# or
pnpm install
```

### Run the dev server

```bash
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

### Build for production

```bash
npm run build
```

This formats the code, type-checks with `tsc`, and produces a production bundle in `dist/`.

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Scripts

| Script    | Description                                  |
| --------- | -------------------------------------------- |
| `dev`     | Start the Vite dev server                    |
| `build`   | Format, type-check, and build for production |
| `preview` | Preview the production build locally         |
| `lint`    | Run ESLint                                   |

## Project Structure

```
├── components/        # Shared components
│   ├── ui/                    # shadcn / Base UI primitives
│   ├── custom/          # App-specific components (e.g. Navbar)
│   └── users/             # Feature components (e.g. UserCard)
├── context/              # React context providers (TanStack Query)
├── features/            # Feature modules (e.g. users)
│   └── users/
│       ├── users.interface.ts
│       ├── users.tq.functions.ts
│       └── users.tq.options.ts
├── hooks/                # Reusable hooks
├── lib/                      # Utilities (e.g. cn helper)
├── public/               # Static assets
└── src/
    ├── index.css        # Tailwind + theme tokens
    ├── main.tsx         # App entry point
    ├── router.tsx       # Route definitions
    └── routes/          # Page-level route components
```

## Routing

Routes are defined declaratively in `src/router.tsx` using `react-router-dom`'s
`<BrowserRouter>` / `<Routes>` API. The root path `/` redirects to `/users`.

```tsx
<BrowserRouter>
  <Routes>
    <Route
      path="/"
      element={<Navigate to="/users" replace />}
    />
    <Route
      path="/users"
      element={
        <>
          <Navbar />
          <UsersPage />
        </>
      }
    />
  </Routes>
</BrowserRouter>
```

Add new routes by creating a component in `src/routes/` and a corresponding
`<Route>` entry in `src/router.tsx`.

## Styling

Styling uses **Tailwind CSS v4** with CSS-first configuration. Theme tokens and
base styles live in `src/index.css`. Components in `components/ui` follow the
shadcn convention and consume CSS variables for theming.

To add a new shadcn component:

```bash
npx shadcn@latest add <component>
```

Components are generated into `components/ui` and consume the `@/components`,
`@/lib`, and `@/hooks` aliases defined in `components.json`.

## Path Aliases

The `@/*` alias maps to the project root (see `vite.config.ts` and
`tsconfig.app.json`). Use it for clean imports:

```ts
import Navbar from '@/components/custom/navbar';
import { cn } from '@/lib/utils';
```

## TanStack Query

The app is wrapped in a `TanstackProvider` (`context/tanstack-context.tsx`).
Define query options per feature (e.g. `features/users/users.tq.options.ts`)
and consume them with `useQuery`:

```tsx
const { data, isPending } = useQuery(usersQueryOptions());
```

React Query Devtools are mounted in `src/main.tsx` (closed by default).

## Notes

- **React Compiler** is enabled via `@vitejs/plugin-react` + Babel. It
  automatically memoizes components, so you generally don't need manual
  `useMemo` / `React.memo`.
- The project uses strict TypeScript; run `npm run build` to catch type errors.
