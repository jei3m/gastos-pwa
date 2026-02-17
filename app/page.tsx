'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/custom/loader';
import { session } from '@/lib/auth/auth-client';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/pages/transactions');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <>
      <Loader />
    </>
  );
}
