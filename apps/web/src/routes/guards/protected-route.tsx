import { Navigate, Outlet } from 'react-router';
import { authClient } from '@/lib/auth/auth-client';
import Loader from '@/components/custom/loader';

export default function ProtectedRoute() {
  const { data: session, isPending } =
    authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
