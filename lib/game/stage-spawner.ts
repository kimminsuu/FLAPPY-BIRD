/**
 * 스테이지 모드 파이프/포탈/중력존 생성
 * - spawnStagePipe(): 스테이지 파이프 + 중력존 + 텔레포트 포탈 생성
 */

import { GAME_CONFIG } from "@/types/game";
import type { StageConfig } from "@/types/stage";
import type { GameStateRef } from "./game-types";
import { spawnItem } from "./game-actions";

/**
 * 스테이지 모드: 거리 기반 파이프 스폰 + 기믹 생성
 * 호출 조건: state.scrollDistance >= state.nextPipeScrollDist && nextPipeIndex < pipes.length
 */
export function spawnStagePipe(state: GameStateRef, stageConfig: StageConfig): void {
  const pipeDef = stageConfig.pipes[state.nextPipeIndex];
  const playH = state.canvasHeight - GAME_CONFIG.groundHeight;
  const margin = pipeDef.gapHeight / 2 + 40;
  const gapY = margin + pipeDef.gapY * (playH - margin * 2);
  const pipeX = state.canvasWidth + 10;
  const pipeId = state.nextPipeId++;

  state.pipes.push({
    id: pipeId,
    x: pipeX,
    gapY,
    gapHeight: pipeDef.gapHeight,
    passed: false,
    width: GAME_CONFIG.pipeWidth,
    isTeleportPipe: !!pipeDef.teleport,
    originalGapHeight: pipeDef.teleport ? pipeDef.gapHeight : undefined,
    speedRing: pipeDef.speedRing,
  });

  // 중력 반전 존 생성 (true 파이프 스폰 시 양쪽 경계를 즉시 확정)
  if (pipeDef.reverseGravity === true) {
    const curIdx = state.nextPipeIndex;
    // startX = 이전 파이프와 이 파이프 사이 중간점
    const startSpacing = pipeDef.spacing ?? stageConfig.pipeSpacing;
    const startGapPx = startSpacing * stageConfig.pipeSpeed - GAME_CONFIG.pipeWidth;
    const startX = pipeX - startGapPx / 2;

    // false 파이프를 미리 찾아서 endX도 즉시 계산
    let totalSpacingFrames = 0;
    let foundFalse = false;
    let endGapPx = 0;
    for (let fi = curIdx + 1; fi < stageConfig.pipes.length; fi++) {
      const futureDef = stageConfig.pipes[fi];
      totalSpacingFrames += futureDef.spacing ?? stageConfig.pipeSpacing;
      if (futureDef.reverseGravity === false) {
        const endSpacing = futureDef.spacing ?? stageConfig.pipeSpacing;
        endGapPx = endSpacing * stageConfig.pipeSpeed - GAME_CONFIG.pipeWidth;
        foundFalse = true;
        break;
      }
    }
    let endX: number;
    if (foundFalse) {
      endX = pipeX - endGapPx / 2 + totalSpacingFrames * stageConfig.pipeSpeed;
    } else {
      // 존이 스테이지 끝까지 이어지는 경우: 마지막 파이프 너머까지 확장
      endX = pipeX + totalSpacingFrames * stageConfig.pipeSpeed + GAME_CONFIG.pipeWidth + 200;
    }

    state.gravityZones.push({ startX, endX });
  }

  // 텔레포트 포탈 생성
  if (pipeDef.teleport) {
    const pairId = state.nextTeleportPairId++;
    const portalSize = 35;
    const inYPos = pipeDef.teleport.inY * playH;
    const outYPos = pipeDef.teleport.outY * playH;
    state.portals.push({
      x: pipeX - 100,
      y: inYPos,
      type: "in",
      activated: false,
      size: portalSize,
      pairId,
      pipeId,
    });
    state.portals.push({
      x: pipeX + GAME_CONFIG.pipeWidth + 100,
      y: outYPos,
      type: "out",
      activated: false,
      size: portalSize,
      pairId,
      pipeId,
    });
  }

  state.nextPipeIndex++;
  // 다음 파이프 스폰 거리 계산 (spacing × basePipeSpeed = 픽셀 거리)
  if (state.nextPipeIndex < stageConfig.pipes.length) {
    const nextDef = stageConfig.pipes[state.nextPipeIndex];
    const spacingFrames = nextDef.spacing ?? stageConfig.pipeSpacing;
    state.nextPipeScrollDist =
      state.scrollDistance + spacingFrames * stageConfig.pipeSpeed;
  }

  // 아이템 생성
  if (stageConfig.enableItems) {
    spawnItem(state);
  }
}
