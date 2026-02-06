/**
 * 게임 관련 타입 정의
 */

import type { BirdRarity } from "./bird";

// 게임 상태
export type GameStatus = "ready" | "playing" | "gameover";

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
  x: number;
  gapY: number; // gap 중심 y 좌표
  gapHeight: number; // gap 높이
  passed: boolean; // 새가 통과했는지
  width: number;
}

// 아이템
export interface GameItem {
  x: number;
  y: number;
  type: ItemType;
  collected: boolean;
  size: number; // ~30px
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
  gravity: 0.5,
  jumpForce: -10,
  pipeSpeed: 3,
  pipeSpawnInterval: 90, // 프레임
  pipeGapMin: 140,
  pipeGapMax: 180,
  pipeWidth: 60,
  groundHeight: 96,
  birdSize: 40,
  birdHitboxPadding: 4, // 히트박스를 시각보다 약간 작게
  itemSize: 30,
  wraithDuration: 3, // 초
  coinRewardMultiplier: 2, // 점수 x 2 = 보상 코인
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
export const PIPE_COLORS: Record<string, { body: string; highlight: string }> =
  {
    spring: { body: "#7CB342", highlight: "#558B2F" },
    summer: { body: "#43A047", highlight: "#2E7D32" },
    autumn: { body: "#8D6E63", highlight: "#5D4037" },
    winter: { body: "#90A4AE", highlight: "#607D8B" },
  } as const;
