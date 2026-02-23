/**
 * 루트 레이아웃
 * - HTML 메타데이터 (타이틀, 뷰포트, 언어)
 * - Providers 래퍼 (UserProvider + SeasonProvider)
 * - 전역 CSS 임포트
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Flappy Bird",
  description: "Flappy Bird 스타일의 캐주얼 모바일 게임",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
