"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ModeSelectionPage from "@/components/mode-selection-page";
import { useUser } from "@/lib/user-context";

export default function ModeSelectRoute() {
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

  return <ModeSelectionPage />;
}
