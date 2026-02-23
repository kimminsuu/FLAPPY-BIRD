/**
 * Context Providers + 앱 컨테이너
 * - Capacitor SystemBars 풀스크린 모드
 * - JS 기반 2:1 비율 컨테이너 (가로 모드, 검정 여백)
 * - UserProvider + SeasonProvider 래핑
 */

"use client";

import { SeasonProvider } from "@/lib/season-context";
import { UserProvider } from "@/lib/user-context";
import { ReactNode, useState, useEffect } from "react";

const ASPECT_RATIO = 2; // width:height = 2:1

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // 풀스크린 모드: 상태바 + 네비게이션바 숨김
  useEffect(() => {
    import("@capacitor/core").then(({ SystemBars }) => {
      SystemBars.hide().catch(() => {});
    }).catch(() => {});
  }, []);

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
