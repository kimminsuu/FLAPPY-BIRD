/**
 * 게임 관련 타입 정의
 * - 게임 상태, 파이프, 파티클, 아이템, 기믹 타입
 * - GAME_CONFIG 상수 (물리, 크기, 보상, 파티클 제한)
 */

import type { BirdRarity } from "./bird";

// 게임 상태
export type GameStatus = "ready" | "playing" | "gameover" | "clear";

// 아이템 종류
export type ItemType = "break" | "wraith" | "point";

// 새 물리 상태
export interface BirdState {
  x: number;
  y: number;
  velocity: number;
  rotation: number; // 기울기 (도)
}

// 파이프
export interface Pipe {
  id: number; // 고유 ID (splice 후에도 안정적 참조)
  x: number;
  gapY: number; // gap 중심 y 좌표
  gapHeight: number; // gap 높이
  passed: boolean; // 새가 통과했는지
  width: number;
  isTeleportPipe?: boolean; // 텔레포트 파이프 여부
  originalGapHeight?: number; // 닫히는 애니메이션용 원래 갭 높이
  speedRing?: "slow" | "fast"; // 스피드 링 타입
}

// 파티클
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: "square" | "circle"; // 모양 (기본: square)
}

// 플로팅 텍스트 이펙트
export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  life: number;
  vy: number; // 위로 떠오르는 속도
}

// 화면 플래시 이펙트
export interface ScreenFlash {
  color: string;
  alpha: number;
  life: number;
}

// 아이템
export interface GameItem {
  x: number;
  y: number;
  type: ItemType;
  collected: boolean;
  size: number; // ~30px
}

// 중력 반전 존
export interface GravityZone {
  startX: number;  // 존 시작 x좌표 (스크롤과 함께 이동)
  endX: number;    // 존 끝 x좌표 (-1이면 아직 미정)
}

// 텔레포트 포탈
export interface TeleportPortal {
  x: number;
  y: number;
  type: "in" | "out";
  activated: boolean;
  size: number;
  pairId: number; // IN/OUT 포탈 매칭용 고유 ID
  pipeId: number; // 연결된 파이프의 고유 ID
}

// 전체 게임 상태
export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  bird: BirdState;
  pipes: Pipe[];
  items: GameItem[];
  frameCount: number;
  isWraith: boolean;
  wraithTimeLeft: number; // 초 단위 (3, 2, 1, 0)
  birdRarity: BirdRarity;
}

// 게임 설정 상수
export const GAME_CONFIG = {
  gravity: 0.08,
  jumpForce: -2.6,
  pipeSpeed: 2,
  pipeSpawnInterval: 160, // 프레임 (가로 모드 축소 반영)
  pipeGapMin: 105,
  pipeGapMax: 135,
  pipeWidth: 48, // 가로 모드 축소
  groundHeight: 48, // 가로 모드 축소
  birdWidth: 40, // 가로 모드 축소
  birdHitboxPadding: 3, // 히트박스를 시각보다 약간 작게
  itemSize: 20,
  wraithDuration: 3, // 초
  coinRewardMultiplier: 1, // 점수 = 보상 코인
  speedRingDuration: 3, // 스피드 링 효과 지속 시간 (초)
  speedRingSlowDivisor: 1.5, // slow 링: 속도 ÷1.5
  speedRingFastMultiplier: 1.25, // fast 링: 속도 ×1.25
  maxParticles: 80, // 파티클 최대 개수 (모바일 성능)
} as const;

// 등급별 아이템 생성 주기 (초, 0이면 아이템 없음)
export const ITEM_SPAWN_INTERVALS: Record<BirdRarity, number> = {
  common: 0,
  rare: 15,
  epic: 11,
  unique: 7,
} as const;

// 아이템 타입 목록
export const ITEM_TYPES: readonly ItemType[] = [
  "break",
  "wraith",
  "point",
] as const;

// 계절별 파이프 색상
export const PIPE_COLORS: Record<
  string,
  { body: string; highlight: string; capEdge: string }
> = {
  spring: { body: "#7CB342", highlight: "#558B2F", capEdge: "#33691E" },
  summer: { body: "#43A047", highlight: "#2E7D32", capEdge: "#1B5E20" },
  autumn: { body: "#8D6E63", highlight: "#5D4037", capEdge: "#3E2723" },
  winter: { body: "#90A4AE", highlight: "#607D8B", capEdge: "#455A64" },
} as const;
