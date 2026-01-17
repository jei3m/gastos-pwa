'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchSession } from '@/utils/session';
import { toast } from 'sonner';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSession().then(({ session }) => {
      if (session) {
        router.push('/pages/transactions');
      }
    });
  }, [router]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    const name = form.get('name') as string;

    const { error } = await authClient.signUp.email({
      name: name,
      email: email,
      password: password,
      callbackURL: '/pages/transactions',
    });

    if (error) {
      setErrors([error.message || 'Unknown Error']);
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('User is registered successfully!');
      router.push('/pages/transactions');
    }
    setLoading(false);
  }

  return (
    <main className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-full w-full px-2 space-y-6 flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Get Started
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label
              htmlFor="name"
              className="text-md font-medium"
            >
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1 h-12 rounded-lg border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-md font-medium"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 h-12 rounded-lg border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-md font-medium"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 h-12 rounded-lg border-2 border-black bg-white"
            />
          </div>

          {errors.length > 0 && (
            <p className="text-md text-red-600">
              {errors[0]}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-12 w-full rounded-lg border-2 font-semibold"
          >
            {loading ? 'Signing up…' : 'SIGN UP'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
