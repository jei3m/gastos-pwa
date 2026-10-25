import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/toast';

export default function AuthLayout() {
  return (
    <div className="m-auto h-full max-w-[600px]">
      <Outlet />
      <Toaster />
    </div>
  );
}
