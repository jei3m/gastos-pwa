'use client';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

interface TanstackProviderProps {
  children: ReactNode;
}

export const TanstackProvider = ({
  children,
}: TanstackProviderProps) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
