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
| Lint/Format | oxlint + oxfmt (Vite+) |

## Getting Started

### Prerequisites

- Bun
- Vite+ (`vp`) installed globally

### Install

```bash
vp install
```

### Run the dev server

```bash
vp run dev:web
```

Then open the printed local URL (default `http://localhost:5173`).

### Build for production

```bash
vp run build
```

This type-checks with `tsc` and produces a production bundle in `dist/`.

### Preview the production build

```bash
vp preview
```

### Check

```bash
vp check
```

## Scripts

| Script    | Description                          |
| --------- | ------------------------------------ |
| `dev`     | Start the Vite dev server            |
| `build`   | Type-check and build for production  |
| `preview` | Preview the production build locally |
| `lint`    | Run oxlint                           |

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
    ├── router.tsx       # Route definitions (createBrowserRouter)
    └── routes/
        ├── auth/        # login.page.tsx, register.page.tsx
        ├── guards/      # protected-route.tsx
        ├── layouts/     # auth-layout.tsx, pages-layout.tsx
        └── pages/       # <resource>.page.tsx route entry points
```

## Routing

Routes are defined in `src/router.tsx` with `createBrowserRouter` from
`react-router`. The root path `/` redirects to `/transactions` when a session
exists, otherwise to `/auth/login`. Page entry points live in
`src/routes/**/<name>.page.tsx` and are loaded lazily.

```tsx
const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <RootRedirect /> },
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },
]);
```

URLs are top-level (`/transactions`, `/accounts/:id`); `/pages/*` is kept only
as a legacy redirect. Add a new page by creating
`src/routes/pages/<name>.page.tsx` exporting `<Name>Page` and registering it in
`src/router.tsx`.

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
Define query options per feature (e.g. `features/accounts/accounts.tq.options.ts`)
and consume them with `useQuery`:

```tsx
const { data, isPending } = useQuery(
  accountsQueryOptions()
);
```

React Query Devtools are mounted in `src/main.tsx` (closed by default).

## Notes

- **React Compiler** is enabled via `@vitejs/plugin-react` + Babel. It
  automatically memoizes components, so you generally don't need manual
  `useMemo` / `React.memo`.
- The project uses strict TypeScript; run `vp run build` to catch type errors.
