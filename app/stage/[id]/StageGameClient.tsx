"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import GamePage from "@/components/game-page";
import { getStageById } from "@/lib/stages";
import { useUser } from "@/lib/user-context";
import type { StageConfig } from "@/types/stage";

export default function StageGameClient() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useUser();
  const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
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
  }, [isLoading, user, router, params.id]);

  if (isLoading || !user || !stageConfig) {
    return null;
  }

  return <GamePage stageConfig={stageConfig} />;
}
