import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth/auth-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      void navigate('/pages/transactions', {
        replace: true,
      });
    }
  }, [navigate, session]);

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
      callbackURL: `${window.location.origin}/pages/transactions`,
    });

    if (error) {
      setErrors([error.message || 'Unknown Error']);
      toast.error(error.message ?? 'Unknown Error');
      setLoading(false);
    } else {
      toast.success('User is registered successfully!');
      void navigate('/pages/transactions');
    }
    setLoading(false);
  }

  return (
    <main className="flex h-full w-full flex-col items-center justify-start">
      <div className="flex h-full w-full flex-col justify-center space-y-6 px-2">
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
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label
              htmlFor="email"
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
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
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
              className="mt-1 h-12"
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
            className="mt-1 h-12 w-full rounded-lg font-semibold"
          >
            {loading ? 'Signing up…' : 'SIGN UP'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-blue-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
