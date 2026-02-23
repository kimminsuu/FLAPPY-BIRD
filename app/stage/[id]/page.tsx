/**
 * 스테이지 모드 게임 라우트 (/stage/[id])
 * - generateStaticParams로 Stage 1~15 정적 생성
 * - StageGameClient에 stageId 전달
 */

import StageGameClient from "./StageGameClient";

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1) }));
}

export default function StageGameRoute() {
  return <StageGameClient />;
}
