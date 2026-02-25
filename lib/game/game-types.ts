/**
 * 게임 상태 타입 및 초기화 함수
 * - GameStateRef: 게임 루프에서 ref로 관리하는 전체 상태
 * - GradientCache: 캔버스 그라디언트 캐시 구조
 * - createInitialState(): 초기 상태 생성
 * - calcStageTotalScrollDist(): 스테이지 총 스크롤 거리 계산
 */

import type { BirdRarity } from "@/types/bird";
import {
  GAME_CONFIG,
  type GameStatus,
  type BirdState,
  type Pipe,
  type GameItem,
  type Particle,
  type FloatingText,
  type ScreenFlash,
  type TeleportPortal,
  type GravityZone,
} from "@/types/game";
import type { StageConfig } from "@/types/stage";

// ==================== 게임 상태 (ref로 관리) ====================

export interface GameStateRef {
  status: GameStatus;
  score: number;
  highScore: number;
  bird: BirdState;
  pipes: Pipe[];
  items: GameItem[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  screenFlash: ScreenFlash | null;
  frameCount: number;
  isWraith: boolean;
  wraithEndTime: number; // Date.now() 기준 종료 시각
  wraithTimeLeft: number;
  birdRarity: BirdRarity;
  lastItemSpawnRealTime: number; // Date.now() 기준
  canvasWidth: number;
  canvasHeight: number;
  nextPipeIndex: number; // 스테이지 모드: 다음 스폰할 파이프 인덱스
  nextPipeFrame: number; // 스테이지 모드: 다음 파이프 스폰 프레임 (레코드 모드 호환)
  scrollDistance: number; // 스테이지 모드: 누적 스크롤 거리 (px)
  nextPipeScrollDist: number; // 스테이지 모드: 다음 파이프 스폰 거리 (px)
  portals: TeleportPortal[];
  isTeleporting: boolean;
  teleportOutPortal: TeleportPortal | null;
  teleportPipe: Pipe | null; // 텔레포트 중인 파이프 직접 참조
  nextPipeId: number; // 파이프 고유 ID 카운터
  nextTeleportPairId: number; // 포탈 페어 ID 카운터
  isGravityReversed: boolean; // 현재 중력 반전 상태
  gravityZones: GravityZone[]; // 반전 존 목록 (렌더링용)
  playStartTime: number; // 플레이 시작 시각 (Date.now())
  speedState: "slow" | "fast" | null; // 현재 스피드 상태
  speedEndTime: number; // 효과 종료 시각 (Date.now 기준)
  speedTimeLeft: number; // UI 표시용 (초 단위)
  lastFrameTime: number; // 델타타임 계산용 (performance.now)
  nextRecordPipeScrollDist: number; // 레코드 모드: 다음 파이프 스폰 거리
}

// ==================== 그라디언트 캐시 ====================

export interface GradientCache {
  season: string;
  canvasHeight: number;
  skyGrad: CanvasGradient | null;
  grassGrad: CanvasGradient | null;
  pipeBodyGrad: CanvasGradient | null;
  pipeCapGrad: CanvasGradient | null;
}

export function createEmptyGradientCache(): GradientCache {
  return {
    season: "",
    canvasHeight: 0,
    skyGrad: null,
    grassGrad: null,
    pipeBodyGrad: null,
    pipeCapGrad: null,
  };
}

// ==================== 초기 상태 생성 ====================

export function createInitialState(
  canvasWidth: number,
  canvasHeight: number,
  rarity: BirdRarity,
  highScore: number
): GameStateRef {
  return {
    status: "ready",
    score: 0,
    highScore,
    bird: {
      x: canvasWidth * 0.25,
      y: canvasHeight * 0.4,
      velocity: 0,
      rotation: 0,
    },
    pipes: [],
    items: [],
    particles: [],
    floatingTexts: [],
    screenFlash: null,
    frameCount: 0,
    isWraith: false,
    wraithEndTime: 0,
    wraithTimeLeft: 0,
    birdRarity: rarity,
    lastItemSpawnRealTime: 0,
    canvasWidth,
    canvasHeight,
    nextPipeIndex: 0,
    nextPipeFrame: 0,
    scrollDistance: 0,
    nextPipeScrollDist: 0,
    portals: [],
    isTeleporting: false,
    teleportOutPortal: null,
    teleportPipe: null,
    nextPipeId: 0,
    nextTeleportPairId: 0,
    isGravityReversed: false,
    gravityZones: [],
    playStartTime: 0,
    speedState: null,
    speedEndTime: 0,
    speedTimeLeft: 0,
    lastFrameTime: 0,
    nextRecordPipeScrollDist: GAME_CONFIG.pipeSpawnInterval * GAME_CONFIG.pipeSpeed,
  };
}

// ==================== 스테이지 총 스크롤 거리 ====================

/**
 * 마지막 파이프가 새를 통과하는 시점까지의 총 스크롤 거리(px)를 계산.
 * - spacing × pipeSpeed = 파이프 간 픽셀 거리 (속도 변해도 일정)
 * - 마지막 파이프 이동 거리: (W+10+pipeWidth) - (W*0.25)
 */
export function calcStageTotalScrollDist(cfg: StageConfig, canvasWidth: number): number {
  // 마지막 파이프 스폰까지의 누적 스크롤 거리
  let lastSpawnDist = cfg.pipeSpeed; // 파이프 0: 즉시 스폰 (1프레임 분)
  for (let i = 1; i < cfg.pipes.length; i++) {
    lastSpawnDist += (cfg.pipes[i].spacing ?? cfg.pipeSpacing) * cfg.pipeSpeed;
  }
  // 마지막 파이프가 새 위치를 지나는 데 필요한 거리
  const travelDist = canvasWidth * 0.75 + 10 + GAME_CONFIG.pipeWidth;
  return lastSpawnDist + travelDist;
}
