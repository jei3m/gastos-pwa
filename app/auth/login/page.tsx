'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { fetchSession } from '@/utils/session';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSession().then(({ session }) => {
      if (session) {
        router.push('/pages/transactions');
      }
    });
  }, [router]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: 'google',
    });

    if (error) {
      setGoogleLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Card container */}
        <div className="bg-white rounded-xl border border-2 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-green-300 to-green-700 rounded-2xl">
              <Image
                alt="Gastos Icon"
                src={'/icons/icons-512x512.png'}
                width={64}
                height={64}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Sign In
              </h1>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-12 rounded-xl border-2 bg-white items-center"
            >
              {googleLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                  <span className="font-medium text-slate-700">
                    Connecting...
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    Sign in with Google
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl"></div>
      </div>
    </main>
  );
}
