"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BirdSelectionPage from "@/components/bird-selection-page";
import { useUser } from "@/lib/user-context";

export default function BirdSelectionRoute() {
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

  return <BirdSelectionPage />;
}
