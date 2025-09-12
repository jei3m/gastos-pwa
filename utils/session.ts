import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';

export async function fetchSession() {
    const { data: session, error } = await authClient.getSession();
    return { session, error};
};

export async function fetchUserID() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user.id;
};