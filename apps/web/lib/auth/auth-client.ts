import { createAuthClient } from 'better-auth/react';
import { toast } from '@/lib/toast';

const baseURL =
  import.meta.env.VITE_API_URL || window.location.origin;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter =
          response.headers.get('X-Retry-After');
        toast.warning(
          `Rate limit exceeded. Retry after ${retryAfter} seconds`
        );
      }
    },
  },
});
