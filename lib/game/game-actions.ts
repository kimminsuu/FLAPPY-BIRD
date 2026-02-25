/**
 * 게임 액션 (순수 함수)
 * - spawnPipe(): 레코드 모드 랜덤 파이프 생성
 * - spawnItem(): 아이템 생성 (등급별 주기)
 * - applyBreak(): 파이프 파괴 아이템 효과
 * - applyWraith(): 무적 아이템 효과
 * - applyPoint(): +5점 아이템 효과
 * - checkAABB(): AABB 충돌 판정
 */

import {
  GAME_CONFIG,
  ITEM_SPAWN_INTERVALS,
  ITEM_TYPES,
  PIPE_COLORS,
} from "@/types/game";
import type { GameStateRef } from "./game-types";

// ==================== 파이프 생성 (레코드 모드) ====================

export function spawnPipe(state: GameStateRef): void {
  const { canvasWidth, canvasHeight } = state;
  const playableHeight = canvasHeight - GAME_CONFIG.groundHeight;
  const gapHeight =
    GAME_CONFIG.pipeGapMin +
    Math.random() * (GAME_CONFIG.pipeGapMax - GAME_CONFIG.pipeGapMin);
  const minGapY = gapHeight / 2 + 40;
  const maxGapY = playableHeight - gapHeight / 2 - 40;

  // 이전 파이프 gap 중심과의 y 거리를 화면의 1/3 이내로 제한
  const maxYDiff = playableHeight * (1 / 3);
  const prevPipe = state.pipes[state.pipes.length - 1];
  let gapY: number;

  if (prevPipe) {
    const lower = Math.max(minGapY, prevPipe.gapY - maxYDiff);
    const upper = Math.min(maxGapY, prevPipe.gapY + maxYDiff);
    gapY = lower + Math.random() * (upper - lower);
  } else {
    gapY = minGapY + Math.random() * (maxGapY - minGapY);
  }

  state.pipes.push({
    id: state.nextPipeId++,
    x: canvasWidth + 10,
    gapY,
    gapHeight,
    passed: false,
    width: GAME_CONFIG.pipeWidth,
  });
}

// ==================== 아이템 생성 ====================

export function spawnItem(state: GameStateRef): void {
  const interval = ITEM_SPAWN_INTERVALS[state.birdRarity];
  if (interval === 0) return;

  const now = Date.now();
  const intervalMs = interval * 1000;
  if (
    now - state.lastItemSpawnRealTime < intervalMs &&
    state.lastItemSpawnRealTime !== 0
  )
    return;

  const recentPipe = state.pipes[state.pipes.length - 1];
  if (!recentPipe) return;

  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  const itemY =
    recentPipe.gapY -
    recentPipe.gapHeight / 2 +
    Math.random() * recentPipe.gapHeight;

  state.items.push({
    x: recentPipe.x + recentPipe.width / 2,
    y: itemY,
    type,
    collected: false,
    size: GAME_CONFIG.itemSize,
  });

  state.lastItemSpawnRealTime = now;
}

// ==================== 아이템 효과 ====================

export function applyBreak(state: GameStateRef, season: string): void {
  const playableHeight = state.canvasHeight - GAME_CONFIG.groundHeight;
  const colors = PIPE_COLORS[season] || PIPE_COLORS.summer;
  let bonusScore = 0;

  for (const pipe of state.pipes) {
    if (!pipe.passed) {
      bonusScore++;
      pipe.passed = true;
    }

    const topH = pipe.gapY - pipe.gapHeight / 2;
    const bottomY = pipe.gapY + pipe.gapHeight / 2;
    const bottomH = playableHeight - bottomY;

    // 상단 파이프 조각 (chunk 최대 4개, 각 2개 파티클)
    const topChunks = Math.min(4, Math.ceil(topH / 20));
    for (let i = 0; i < topChunks && state.particles.length < GAME_CONFIG.maxParticles; i++) {
      const py = (topH / topChunks) * i + 10;
      for (let j = 0; j < 2 && state.particles.length < GAME_CONFIG.maxParticles; j++) {
        state.particles.push({
          x: pipe.x + Math.random() * pipe.width,
          y: py,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 1) * 6,
          size: 6 + Math.random() * 8,
          color: Math.random() > 0.5 ? colors.body : colors.highlight,
          alpha: 1,
          life: 40 + Math.random() * 20,
          maxLife: 50,
        });
      }
    }

    // 하단 파이프 조각 (chunk 최대 4개, 각 2개 파티클)
    const bottomChunks = Math.min(4, Math.ceil(bottomH / 20));
    for (let i = 0; i < bottomChunks && state.particles.length < GAME_CONFIG.maxParticles; i++) {
      const py = bottomY + (bottomH / bottomChunks) * i + 10;
      for (let j = 0; j < 2 && state.particles.length < GAME_CONFIG.maxParticles; j++) {
        state.particles.push({
          x: pipe.x + Math.random() * pipe.width,
          y: py,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 1) * 6,
          size: 6 + Math.random() * 8,
          color: Math.random() > 0.5 ? colors.body : colors.highlight,
          alpha: 1,
          life: 40 + Math.random() * 20,
          maxLife: 50,
        });
      }
    }
  }

  state.score += bonusScore;
  state.pipes = [];
}

export function applyWraith(state: GameStateRef, birdAspect: number): void {
  const bx = state.bird.x + GAME_CONFIG.birdWidth / 2;
  const by = state.bird.y + GAME_CONFIG.birdWidth * birdAspect / 2;

  state.isWraith = true;
  state.wraithEndTime = Date.now() + GAME_CONFIG.wraithDuration * 1000;
  state.wraithTimeLeft = GAME_CONFIG.wraithDuration;

  // 보라색 원형 파티클 방사
  for (let i = 0; i < 16 && state.particles.length < GAME_CONFIG.maxParticles; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    const speed = 2 + Math.random() * 3;
    state.particles.push({
      x: bx,
      y: by,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      color: Math.random() > 0.5 ? "#A855F7" : "#7C3AED",
      alpha: 1,
      life: 30 + Math.random() * 15,
      maxLife: 45,
      type: "circle",
    });
  }

  // 화면 보라색 플래시
  state.screenFlash = { color: "rgba(168, 85, 247, 0.3)", alpha: 1, life: 15 };
}

export function applyPoint(state: GameStateRef, birdAspect: number): void {
  const bx = state.bird.x + GAME_CONFIG.birdWidth / 2;
  const by = state.bird.y + GAME_CONFIG.birdWidth * birdAspect / 2;

  state.score += 5;

  // 금색 스파클 파티클
  for (let i = 0; i < 12 && state.particles.length < GAME_CONFIG.maxParticles; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 1.5 + Math.random() * 2.5;
    state.particles.push({
      x: bx,
      y: by,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: 3 + Math.random() * 4,
      color: Math.random() > 0.3 ? "#FBBF24" : "#F59E0B",
      alpha: 1,
      life: 25 + Math.random() * 15,
      maxLife: 40,
      type: "circle",
    });
  }

  // "+5" 플로팅 텍스트
  state.floatingTexts.push({
    x: bx,
    y: by - 15,
    text: "+5",
    color: "#FBBF24",
    fontSize: 20,
    alpha: 1,
    life: 50,
    vy: -1.5,
  });

  // 화면 금색 플래시
  state.screenFlash = { color: "rgba(251, 191, 36, 0.25)", alpha: 1, life: 10 };
}

// ==================== 충돌 판정 ====================

export function checkAABB(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
