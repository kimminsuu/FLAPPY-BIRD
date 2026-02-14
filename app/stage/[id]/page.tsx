"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GamePage from "@/components/game-page";
import { getStageById } from "@/lib/stages";
import type { StageConfig } from "@/types/stage";

export default function StageGameRoute() {
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);

  useEffect(() => {
    const authUser = localStorage.getItem("flappy_auth_user");
    if (!authUser) {
      router.replace("/");
      return;
    }

    const stageId = Number(params.id);
    const stage = getStageById(stageId);
    if (!stage) {
      router.replace("/stage-select");
      return;
    }

    setStageConfig(stage);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, params.id]);

  if (isLoading || !isAuthenticated || !stageConfig) {
    return null;
  }

  return <GamePage stageConfig={stageConfig} />;
}
