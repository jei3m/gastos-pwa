import { Navigate, useLocation } from 'react-router';

export default function LegacyPagesRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = pathname.replace(/^\/pages/, '') || '/';

  return (
    <Navigate to={`${target}${search}${hash}`} replace />
  );
}
