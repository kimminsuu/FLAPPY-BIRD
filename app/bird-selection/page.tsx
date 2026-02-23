/**
 * 새 선택 페이지 라우트 (/bird-selection)
 * - 인증 가드: 미로그인 시 / 로 리다이렉트
 * - BirdSelectionPage 컴포넌트 렌더링
 */

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
