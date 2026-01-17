import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flappy Bird",
  description: "Flappy Bird 스타일의 캐주얼 모바일 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
