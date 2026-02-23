/**
 * 레코드 모드 게임 라우트 (/game)
 * - 인증 가드: 미로그인 시 / 로 리다이렉트
 * - GamePage 컴포넌트 렌더링 (stageConfig 없음 = 레코드 모드)
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GamePage from "@/components/game-page";
import { useUser } from "@/lib/user-context";

export default function GameRoute() {
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

  return <GamePage />;
}
