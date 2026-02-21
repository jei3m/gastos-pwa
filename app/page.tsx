'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/custom/loader';
import { fetchSession } from '@/utils/session';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    fetchSession().then(({ session }) => {
      if (session) {
        router.push('/pages/transactions');
      } else {
        router.push('/auth/login');
      }
    });
  }, [router]);

  return (
    <>
      <Loader />
    </>
  );
}
