import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Loader from '@/components/custom/loader';
import { fetchSession } from '@/lib/auth/auth-session';

export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void fetchSession().then(({ session }) => {
      if (session) {
        void navigate('/pages/transactions', {
          replace: true,
        });
      } else {
        void navigate('/auth/login', { replace: true });
      }
    });
  }, [navigate]);

  return <Loader />;
}
