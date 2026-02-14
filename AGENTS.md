# Agent Guidelines

This document provides guidelines for AI agents working on this budget tracker PWA built with Next.js 16, React 19, and MySQL.

## Commands

```bash
bun next dev -p 3000    # Start development server on port 3000
bun next build          # Build for production
next start              # Start production server
bun eslint              # Run ESLint (Next.js + TypeScript config)
```

No test framework is currently configured.

## Project Structure

- `app/` - Next.js App Router (pages, layouts, API routes)
- `components/` - React components
  - `ui/` - ShadCN/UI components
  - `custom/` - Custom application components
  - `[route]/` - Route-specific components (folder name matches route path, e.g., `transactions/`, `categories/`, `accounts/`)
- `lib/` - Business logic, schemas, SQL queries
- `context/` - React Context providers
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

## Code Style

### Imports

Use `@/` alias for all internal imports:

```ts
import { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Button } from '@/components/ui/button';
import { createTransactionSchema } from '@/lib/schema/transactions.schema';
import { cn } from '@/lib/utils';
```

Prefer named imports; use default imports only for components.

### Naming Conventions

- **Components**: PascalCase (`AddTransactionForm`)
- **Functions/Variables**: camelCase (`createTransaction`, `selectedAccountID`)
- **Types/Interfaces**: PascalCase (`TransactionData`)
- **Constants**: UPPER_SNAKE_CASE (`MOBILE_BREAKPOINT`)
- **Foreign Keys**: `ref[TableAcronym]ID` (`refAccountsID`, `refCategoriesID`)
- **File Names**: camelCase for components (`.tsx`), `.schema.ts` for Zod schemas, `.sql.ts` for SQL queries

### TypeScript

Define types in `types/` directory. Use interfaces for object shapes:

```ts
export interface Transaction {
  id: string;
  note: string;
  amount: number;
}
```

Use type guards for error handling:

```ts
if (error instanceof Error) {
  throw Error(error.message);
}
```

### Component Patterns

**Component Organization**: Place route-specific components in `components/[routeName]/` where folder name matches route path. Example: `/app/pages/transactions` → `components/transactions/AddTransactionForm.tsx`

**Client Components**: Add `'use client'` directive at top of file. Use for interactivity.

```ts
'use client';
import { useState } from "react";

export default function MyComponent() {
  const [value, setValue] = useState<string>('');
  return <div>{value}</div>;
}
```

**Server Components**: Default (no directive). Use for data fetching and static content.

```ts
import { db } from '@/utils/db';

export default async function Page() {
  const data = await db.query('...');
  return <div>{data}</div>;
}
```

**Props**: Define interfaces, use destructuring:

```ts
interface Props {
  title: string;
  onAction: () => void;
}

export default function MyComponent({
  title,
  onAction,
}: Props) {
  // ...
}
```

### Forms

Use react-hook-form with Zod validation:

```ts
const form = useForm<z.infer<typeof createTransactionSchema>>({
  resolver: zodResolver(createTransactionSchema),
  defaultValues: { note: '' }
});

<FormField
  control={form.control}
  name="note"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Note</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### API Routes

Use parameterized queries, handle errors consistently:

```ts
export async function POST(req: NextRequest) {
  try {
    const { note, amount } = await req.json();
    const [rows] = await db.query(sql, { note, amount });
    return success({ data: rows });
  } catch (error) {
    return fail(
      500,
      error instanceof Error ? error.message : 'Failed'
    );
  } finally {
    connection.release();
  }
}
```

Use `success()` and `fail()` from `@/utils/helpers` for responses.

### Data Fetching

**Server Components**: Use direct database calls or fetch.

**Client Components**: Use TanStack Query:

```ts
const { data, isPending, mutate } = useQuery({
  queryKey: ['transactions', accountId],
  queryFn: () => fetchTransactions(accountId),
});

const { mutate } = useMutation({
  mutationFn: createTransaction,
  onSuccess: () =>
    queryClient.invalidateQueries(['transactions']),
});
```

### ShadCN/UI Components

Always use existing components before creating custom ones. Import from `@/components/ui/`:

```ts
import { Button, Input, Card } from '@/components/ui';
```

Use `cn()` utility for conditional classes:

```ts
<div className={cn("base-class", isActive && "active-class")} />
```

### Context

Create context providers in `context/`, define explicit types:

```ts
type ContextType = {
  value: string;
  setValue: (val: string) => void;
};

const Context = createContext<ContextType | undefined>(
  undefined
);

export function useMyContext() {
  const context = useContext(Context);
  if (!context)
    throw new Error(
      'useMyContext must be used within provider'
    );
  return context;
}
```

### SQL/Database

**Naming & Format:**

- Use `:parameter` syntax for parameterized queries
- SQL files in `lib/sql/[entity]/` as `.sql.ts`
- Use `@response` for stored procedure output
- Format: 4-space indentation
- Use snake_case for tables, columns, identifiers
- Variables start with `v_`, input parameters start with `p_`
- Only use camelCase for view output columns

**Queries:**

```ts
export const getTransactions = () => {
  return `SELECT id, note, amount FROM transactions WHERE user_id = :userID`;
};
```

**Database Design:**

- UUID columns: `CHAR(36)`
- Foreign keys: `ref_[table_acronym]_id` (use `_id` column, NOT `reference_id`)
- Column order: `_id` first, then `uuid`
- Primary keys: compose of `_id` and `tenant_id`
- Timestamps: `DEFAULT CURRENT_TIMESTAMP`
- For EXISTS queries: use `SELECT 1` with `LIMIT 1`

**Do:**

- Use snake_case for SQL identifiers
- Use standard SQL functions for portability
- Use C-style comments `/* */` for multi-line, `--` for single-line
- Use backticks for identifiers with special characters
- Store dates as ISO 8601 (YYYY-MM-DD HH:MM:SS.SSSSS)

**Avoid:**

- CamelCase in SQL (except view outputs)
- Prefixes like `sp_` or `tbl_`
- Plural table names (use collective terms)
- Object-oriented design in SQL

### Hooks

Custom hooks in `hooks/` directory:

```ts
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // ...
  return isMobile;
}
```

## Tech Stack

- **Next.js**: 16.0.10 (App Router)
- **React**: 19.2.3
- **TypeScript**: v5
- **Tailwind CSS**: v4
- **Database**: MySQL with mysql2 driver
- **Auth**: Better Auth
- **Forms**: React Hook Form + Zod + @hookform/resolvers
- **Data Fetching**: TanStack Query (client-side)
- **UI**: ShadCN/UI + Radix UI Primitives + Lucide React
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **Charts**: Recharts
- **Toasts**: Sonner
- **Date**: date-fns

## Error Handling

1. Check `error instanceof Error` before accessing `.message`
2. Use try/catch in all async operations
3. Provide meaningful error messages
4. Use toast notifications (`sonner`) for user feedback

## Styling

Use Tailwind CSS utility classes. Prefer utility-first approach, organize classes: layout > spacing > color > effects.

Mobile-first responsive design with `sm:`, `md:`, `lg:` prefixes.

**Spacing Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, etc.

**Dark Mode**: Use `next-themes` with Tailwind's `dark:` variant

## React Best Practices

- Use functional components with TypeScript interfaces
- Define clear prop interfaces and use destructuring
- Keep components focused on single responsibility
- Use `useCallback` and `useMemo` for performance optimization
- Minimize re-renders with proper memoization
- Use lazy loading for non-critical components

## Accessibility

- Implement proper semantic HTML structure
- Use appropriate ARIA attributes
- Ensure proper focus management
- Follow WCAG guidelines
- Test keyboard navigation
- Use proper heading hierarchy

## Commit Messages

Use prefixes: `feat:`, `fix:`, `chore:`, `del:`, `ref:`

**Mapping to PR Sections:**

- `feat:` commits → Features section
- `fix:` commits → Fixes section
- `ref:` commits → Refactor section
- `chore:` commits → Chores section
- `del:` commits → Refactor or Fixes section (depending on context)

## Important

- Never add comments unless asked
- Minimize client components for performance
- Follow existing patterns in the codebase
- Run `eslint` before committing

## PR Description Format

## Summary of Changes

[A brief and concise description of all changes]

### Features

- [list of new features implemented as plain descriptions]

### Fixes

- [list of fixes as plain descriptions]

### Refactor

- [list of refactors as plain descriptions]

### Chores

- [list of chores as plain descriptions]

**Important:** Do NOT include commit prefixes (feat:, fix:, ref:, chore:, del:, etc.) in PR descriptions. DO NOT also directly copy the commit message. Promptly describe the changes made.

**Empty Sections:** Do NOT include sections that have no commits. For example, if there are no `feat:` commits, omit the "### Features" section entirely.
