"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StageSelectPage from "@/components/stage-select-page";

export default function StageSelectRoute() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authUser = localStorage.getItem("flappy_auth_user");
    if (!authUser) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <StageSelectPage />;
}
