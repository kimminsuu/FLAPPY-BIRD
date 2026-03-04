/**
 * 일일 보상 (Daily Reward) 시스템
 * - 7일 주기 보상 정의 (코인 / 새)
 * - KST(UTC+9) 자정 기준 날짜 계산
 * - 매주 월요일 주간 리셋 (이전 주 진행도 무관하게 Day 1부터 재시작)
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

/** KST 날짜 문자열이 속한 주의 월요일 (YYYY-MM-DD) */
export function getMondayOfWeekKST(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + diff);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** 마지막 수령일 기준으로 새로운 주(월요일 리셋)인지 판별 */
export function isNewWeek(lastRewardDate: string | null): boolean {
  if (!lastRewardDate) return true;
  return getMondayOfWeekKST(lastRewardDate) !== getMondayOfWeekKST(getTodayKST());
}

/**
 * 주간 리셋을 반영한 실질적 보상 일차
 * - 새 주(월요일 이후)면 0 반환 → Day 1부터 시작
 * - 같은 주면 DB값 그대로 반환
 */
export function getEffectiveRewardDay(rewardDay: number, lastRewardDate: string | null): number {
  if (isNewWeek(lastRewardDate)) return 0;
  return rewardDay;
}

/** 오늘 보상을 수령할 수 있는지 (주간 7일 완료 체크 포함) */
export function canClaimReward(rewardDay: number, lastRewardDate: string | null): boolean {
  if (lastRewardDate === getTodayKST()) return false; // 오늘 이미 수령
  const effective = getEffectiveRewardDay(rewardDay, lastRewardDate);
  return effective < 7; // 이번 주 7일 모두 수령했으면 불가
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
