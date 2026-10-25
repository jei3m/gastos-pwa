import type { ReactNode } from 'react';
import { toast as toastManager } from '@/components/ui/toast';

interface ToastOptions {
  description?: ReactNode;
  timeout?: number;
}

function notify(
  type: string,
  title: ReactNode,
  options?: ToastOptions
) {
  return toastManager.add({ title, type, ...options });
}

export const toast = {
  success: (title: ReactNode, options?: ToastOptions) =>
    notify('success', title, options),
  error: (title: ReactNode, options?: ToastOptions) =>
    notify('error', title, options),
  warning: (title: ReactNode, options?: ToastOptions) =>
    notify('warning', title, options),
  info: (title: ReactNode, options?: ToastOptions) =>
    notify('info', title, options),
  loading: (title: ReactNode, options?: ToastOptions) =>
    notify('loading', title, options),
  message: (title: ReactNode, options?: ToastOptions) =>
    notify('default', title, options),
};
