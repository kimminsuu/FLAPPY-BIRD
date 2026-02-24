/**
 * 일일 보상 (Daily Reward) 시스템
 * - 7일 주기 보상 정의 (코인 / 새)
 * - KST(UTC+9) 자정 기준 날짜 계산
 * - 보상 수령 가능 여부 판별
 * - 등급별 미보유 새 랜덤 선택
 */

import { BIRDS, getBirdsByRarity, getBirdById } from "./birds";
import type { BirdRarity } from "@/types/bird";
import type { Bird } from "@/types/bird";

// ==================== 타입 ====================

export type RewardType = "coins" | "bird";

export interface DailyRewardDef {
  day: number;
  type: RewardType;
  /** 코인 보상일 때 금액 */
  coins?: number;
  /** 새 보상일 때 등급 */
  rarity?: BirdRarity;
}

export interface ClaimResult {
  claimed: boolean;
  day?: number;
  type?: RewardType;
  /** 코인 획득량 (코인 보상 또는 대체 코인) */
  coins?: number;
  /** 획득한 새 (새 보상 시) */
  bird?: Bird;
  /** 모두 보유하여 코인으로 대체됐는지 */
  isFallback?: boolean;
}

// ==================== 상수 ====================

/** 7일 주기 보상 테이블 */
export const DAILY_REWARDS: readonly DailyRewardDef[] = [
  { day: 1, type: "coins", coins: 200 },
  { day: 2, type: "coins", coins: 300 },
  { day: 3, type: "bird", rarity: "rare" },
  { day: 4, type: "coins", coins: 500 },
  { day: 5, type: "bird", rarity: "epic" },
  { day: 6, type: "coins", coins: 700 },
  { day: 7, type: "bird", rarity: "unique" },
] as const;

/** 새 보상을 모두 보유 시 대체 코인 */
export const BIRD_FALLBACK_COINS: Record<string, number> = {
  rare: 500,
  epic: 1000,
  unique: 2000,
};

// ==================== 유틸 함수 ====================

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function getTodayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 오늘 보상을 아직 수령하지 않았는지 */
export function canClaimToday(lastRewardDate: string | null): boolean {
  return lastRewardDate !== getTodayKST();
}

/** 다음 보상 일차 (7일 주기 순환) */
export function getNextRewardDay(currentDay: number): number {
  return (currentDay % 7) + 1;
}

/** 보상 정의 조회 (day: 1~7) */
export function getRewardDef(day: number): DailyRewardDef {
  return DAILY_REWARDS[day - 1];
}

/**
 * 해당 등급 미보유 새 중 랜덤 1마리 선택
 * @returns 새 또는 null (모두 보유 시)
 */
export function pickRandomBird(
  rarity: BirdRarity,
  ownedBirdIds: string[]
): Bird | null {
  const birdsOfRarity = getBirdsByRarity(rarity);
  const unowned = birdsOfRarity.filter((b) => !ownedBirdIds.includes(b.id));

  if (unowned.length === 0) return null;

  return unowned[Math.floor(Math.random() * unowned.length)];
}
