"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/utils/session";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    fetchSession().then(({session}) => {
      if (session) {
        router.push('/pages/transactions');
      } else {
        router.push('/auth/login');
      };
    });
  },[router])

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Loader2 className="text-green-600 w-14 h-14 animate-spin" />
    </div>
  )
};
