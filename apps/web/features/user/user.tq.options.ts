import { queryOptions } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';
import { fetchUserByEmail } from './user.tq.functions';

export function userByEmailQueryOptions(email: string) {
  return queryOptions({
    queryKey: ['users', 'email', email],
    queryFn: () => fetchUserByEmail(email),
    enabled: !!email,
    retry: false,
  });
}

export function sessionsQueryOptions() {
  return queryOptions({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } =
        await authClient.listSessions();
      if (error) {
        throw new Error(
          error.message ?? 'Failed to fetch sessions'
        );
      }
      return data;
    },
  });
}
