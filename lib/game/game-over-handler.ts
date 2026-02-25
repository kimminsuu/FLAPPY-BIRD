/**
 * 게임오버/클리어 처리
 * - handleGameOver(): 게임오버 시 점수/코인/진행률 처리
 * - handleStageClear(): 스테이지 클리어 처리
 */

import { GAME_CONFIG, type GameStatus } from "@/types/game";
import type { StageConfig } from "@/types/stage";
import type { GameStateRef } from "./game-types";
import { calcStageTotalScrollDist } from "./game-types";
import {
  addCoins,
  updateHighScore,
  updateStageBest,
} from "@/lib/user-service";

export interface GameOverCallbacks {
  userId: string;
  highScoreRef: { current: number };
  userCoinsRef: { current: number };
  patchUser: (updates: Record<string, unknown>) => void;
  setScore: (s: number) => void;
  setHighScore: (s: number) => void;
  setCoinReward: (c: number) => void;
  setProgress: (p: number) => void;
  setGameStatus: (s: GameStatus) => void;
}

export function handleStageClear(
  state: GameStateRef,
  stageConfig: StageConfig,
  cb: GameOverCallbacks
): void {
  state.status = "clear";
  cb.setProgress(100);
  if (cb.userId) updateStageBest(cb.userId, stageConfig.id, 100);
  cb.setCoinReward(0);
  cb.setScore(state.score);
  cb.setGameStatus("clear");
}

export function handleGameOver(
  state: GameStateRef,
  stageConfig: StageConfig | undefined,
  cb: GameOverCallbacks
): void {
  if (stageConfig) {
    // 스테이지 모드: 스크롤 거리 기반 진행률
    const totalDist = calcStageTotalScrollDist(stageConfig, state.canvasWidth);
    const finalPct = Math.min(99, Math.floor((state.scrollDistance / totalDist) * 100));
    cb.setProgress(finalPct);
    if (cb.userId) updateStageBest(cb.userId, stageConfig.id, finalPct);
  } else {
    // RECORD 모드: 최고점수 저장
    const currentBest = Math.max(state.highScore, cb.highScoreRef.current);
    if (state.score > currentBest) {
      state.highScore = state.score;
      cb.highScoreRef.current = state.score;
      if (cb.userId) updateHighScore(cb.userId, state.score);
      cb.patchUser({ high_score: state.score });
    } else {
      state.highScore = currentBest;
    }
  }

  const reward = stageConfig
    ? 0
    : state.score * GAME_CONFIG.coinRewardMultiplier;
  if (reward > 0 && cb.userId) {
    addCoins(cb.userId, reward);
    const newCoins = cb.userCoinsRef.current + reward;
    cb.userCoinsRef.current = newCoins;
    cb.patchUser({ coins: newCoins });
  }
  cb.setCoinReward(reward);
  cb.setScore(state.score);
  cb.setHighScore(state.highScore);
  cb.setGameStatus("gameover");
}
