"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchSession } from "@/utils/session";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSession().then(({session}) => {
      if (session) {
        router.push('/pages/transactions')
      } 
    });
  },[router]);

  async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
      rememberMe: true,
      callbackURL: '/pages/transactions',
    });

    if (error) {
      setErrors([error.message || "Unknown Error"]);
      setLoading(false);
    };
    
    setLoading(false);
  };

  return (
    <main className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-full w-full px-2 space-y-6 flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-md font-medium">
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
            <Label htmlFor="password" className="text-md font-medium">
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
            <p className="text-md text-red-600">{errors[0]}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-12 w-full rounded-lg border-2 font-semibold"
          >
            {loading ? "Signing up…" : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          No account yet?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
};
