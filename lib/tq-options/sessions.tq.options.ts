import { queryOptions } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';

export function sessionsQueryOptions() {
  return queryOptions({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } =
        await authClient.listSessions();
      if (error) {
        throw Error(
          error.message ?? 'Failed to fetch sessions'
        );
      }
      return data;
    },
  });
}
