"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/utils/session";
import Loader from "@/components/custom/loader";

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
    <>
      <Loader/>
    </>
  )
};
