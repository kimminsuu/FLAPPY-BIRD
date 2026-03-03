/**
 * Context Providers + 앱 컨테이너
 * - Capacitor SystemBars 풀스크린 모드
 * - JS 기반 2:1 비율 컨테이너 (가로 모드, 검정 여백)
 * - UserProvider + SeasonProvider 래핑
 * - BGM 제어: 첫 클릭 시 시작, 게임 라우트(/game, /stage/) 진입 시 일시정지/복귀
 */

"use client";

import { SeasonProvider } from "@/lib/season-context";
import { UserProvider } from "@/lib/user-context";
import { startBGM, pauseBGM, resumeBGM } from "@/lib/sound";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

const ASPECT_RATIO = 2; // width:height = 2:1

interface ProvidersProps {
  children: ReactNode;
}

// 게임 플레이 중인 라우트 (BGM 일시정지)
const GAME_ROUTES = ["/game", "/stage/"];

export default function Providers({ children }: ProvidersProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const pathname = usePathname();

  // 풀스크린 모드: 상태바 + 네비게이션바 숨김
  useEffect(() => {
    import("@capacitor/core").then(({ SystemBars }) => {
      SystemBars.hide().catch(() => {});
    }).catch(() => {});
  }, []);

  // 첫 클릭 시 BGM 시작 (브라우저 자동재생 정책 대응)
  const handleFirstInteraction = useCallback(() => {
    startBGM();
    window.removeEventListener("click", handleFirstInteraction);
    window.removeEventListener("touchstart", handleFirstInteraction);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [handleFirstInteraction]);

  // 라우트 변경 시 BGM 제어
  useEffect(() => {
    const isGameRoute = GAME_ROUTES.some((r) => pathname.startsWith(r));
    if (isGameRoute) {
      pauseBGM();
    } else {
      resumeBGM();
    }
  }, [pathname]);

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let w: number;
      let h: number;

      if (vw / vh > ASPECT_RATIO) {
        h = vh;
        w = vh * ASPECT_RATIO;
      } else {
        w = vw;
        h = vw / ASPECT_RATIO;
      }

      setSize({ w: Math.floor(w), h: Math.floor(h) });
    }

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  if (!size) return null;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: size.w,
    height: size.h,
    overflow: "hidden",
    transform: "translate3d(0, 0, 0)",
  };

  return (
    <UserProvider>
      <SeasonProvider>
        <div style={containerStyle}>{children}</div>
      </SeasonProvider>
    </UserProvider>
  );
}
