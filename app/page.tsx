/**
 * 메인 진입 페이지 (/)
 * - 로그인 상태 확인 → /home 리다이렉트
 * - 미로그인 → LoginPage 렌더링
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/login-page";
import { useUser } from "@/lib/user-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return null;
  }

  return <LoginPage />;
}
