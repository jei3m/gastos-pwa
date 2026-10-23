import {
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';

export default function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-2xl font-bold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">{message}</p>
    </main>
  );
}
