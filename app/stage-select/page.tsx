"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StageSelectPage from "@/components/stage-select-page";
import { useUser } from "@/lib/user-context";

export default function StageSelectRoute() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return null;
  }

  return <StageSelectPage />;
}
