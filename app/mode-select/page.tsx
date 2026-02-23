/**
 * 모드 선택 페이지 라우트 (/mode-select)
 * - 인증 가드: 미로그인 시 / 로 리다이렉트
 * - ModeSelectionPage 컴포넌트 렌더링
 */

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
