/**
 * Context Providers + 앱 컨테이너
 * - Capacitor SystemBars 풀스크린 모드
 * - JS 기반 2:1 비율 컨테이너 (가로 모드, 검정 여백)
 * - UserProvider + SeasonProvider 래핑
 * - BGM 제어: 홈/선택 화면에서 재생, 게임(/game, /stage/) 진입 시 정지, 복귀 시 재시작
 */

"use client";

import { SeasonProvider } from "@/lib/season-context";
import { UserProvider } from "@/lib/user-context";
import { startBGM, pauseBGM, restartBGM, resumeBGMIfWanted } from "@/lib/sound";
import { ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

const ASPECT_RATIO = 2; // width:height = 2:1

interface ProvidersProps {
  children: ReactNode;
}

// 게임 플레이 라우트 (BGM 정지)
const GAME_ROUTES = ["/game", "/stage/"];

export default function Providers({ children }: ProvidersProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef("");

  // 풀스크린 모드: 상태바 + 네비게이션바 숨김
  useEffect(() => {
    import("@capacitor/core").then(({ SystemBars }) => {
      SystemBars.hide().catch(() => {});
    }).catch(() => {});
  }, []);

  // 첫 인터랙션에서 자동재생 차단 해제 (브라우저 정책 대응)
  const handleFirstInteraction = useCallback(() => {
    resumeBGMIfWanted();
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
  // - 첫 마운트(홈): BGM 시작
  // - 게임 진입: 정지
  // - 게임→홈 복귀: 처음부터 재시작
  // - 비게임 간 이동: BGM 유지
  useEffect(() => {
    const isGameRoute = GAME_ROUTES.some((r) => pathname.startsWith(r));
    const wasGameRoute = GAME_ROUTES.some((r) => prevPathnameRef.current.startsWith(r));

    if (isGameRoute) {
      pauseBGM();
    } else if (wasGameRoute) {
      restartBGM();
    } else if (prevPathnameRef.current === "") {
      // 앱 최초 마운트 → BGM 시작 (자동재생 차단 시 첫 터치에서 재개됨)
      startBGM();
    }

    prevPathnameRef.current = pathname;
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
