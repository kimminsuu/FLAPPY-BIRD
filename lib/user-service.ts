/**
 * Supabase 기반 유저 데이터 서비스
 * 모든 유저 관련 CRUD를 담당
 */

import { supabase } from "./supabase";
import {
  canClaimToday,
  getNextRewardDay,
  getRewardDef,
  getTodayKST,
  pickRandomBird,
  BIRD_FALLBACK_COINS,
  type ClaimResult,
} from "./daily-rewards";

// ==================== 타입 ====================

export interface DbUser {
  id: string; // UUID
  device_id: string;
  username: string;
  coins: number;
  high_score: number;
  equipped_bird_id: string;
  season: string;
  reward_day: number; // 마지막 수령 보상 일차 (0=미수령, 1~7)
  last_reward_date: string | null; // 마지막 수령 날짜 (KST 'YYYY-MM-DD')
  created_at: string;
  updated_at: string;
}

export interface DbStageRecord {
  user_id: string;
  stage_id: number;
  best_percent: number;
  cleared: boolean;
  cleared_at: string | null;
  updated_at: string;
}

// ==================== 유저 조회/생성 ====================

/** deviceId로 유저 조회 */
export async function getUserByDeviceId(deviceId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("device_id", deviceId)
    .single();

  if (error || !data) return null;
  return data as DbUser;
}

/** 닉네임 중복 확인 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("user")
    .select("*", { count: "exact", head: true })
    .ilike("username", username);

  if (error) return false;
  return count === 0;
}

/** 신규 유저 생성 (닉네임 설정 시) */
export async function createUser(
  deviceId: string,
  username: string
): Promise<DbUser | null> {
  const { data: user, error: userError } = await supabase
    .from("user")
    .insert({ device_id: deviceId, username })
    .select()
    .single();

  if (userError || !user) return null;

  // 기본 새 (bird_common_1) 지급
  await supabase.from("user_bird").insert({
    user_id: user.id,
    bird_id: "bird_common_1",
  });

  return user as DbUser;
}

// ==================== 닉네임 ====================

/** 닉네임 변경 */
export async function updateUsername(
  userId: string,
  newUsername: string
): Promise<boolean> {
  const { error } = await supabase
    .from("user")
    .update({ username: newUsername, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return !error;
}

// ==================== 코인 ====================

/** 코인 조회 */
export async function getCoins(userId: string): Promise<number> {
  const { data } = await supabase
    .from("user")
    .select("coins")
    .eq("id", userId)
    .single();

  return data?.coins ?? 0;
}

/** 코인 설정 (절대값) */
export async function setCoins(userId: string, amount: number): Promise<void> {
  await supabase
    .from("user")
    .update({ coins: amount, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

/** 코인 추가 (상대값) */
export async function addCoins(userId: string, amount: number): Promise<number> {
  const current = await getCoins(userId);
  const newAmount = current + amount;
  await setCoins(userId, newAmount);
  return newAmount;
}

/** 코인 차감 (잔액 부족 시 실패) */
export async function subtractCoins(
  userId: string,
  amount: number
): Promise<{ success: boolean; newAmount: number }> {
  const current = await getCoins(userId);
  if (current < amount) {
    return { success: false, newAmount: current };
  }
  const newAmount = current - amount;
  await setCoins(userId, newAmount);
  return { success: true, newAmount };
}

// ==================== 새 보유/장착 ====================

/** 보유 새 ID 목록 조회 */
export async function getOwnedBirdIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_bird")
    .select("bird_id")
    .eq("user_id", userId);

  return data?.map((row) => row.bird_id) ?? [];
}

/** 새 추가 (뽑기 등) */
export async function addBird(userId: string, birdId: string): Promise<void> {
  await supabase.from("user_bird").insert({
    user_id: userId,
    bird_id: birdId,
  });
}

/** 장착 새 변경 */
export async function equipBird(userId: string, birdId: string): Promise<void> {
  await supabase
    .from("user")
    .update({ equipped_bird_id: birdId, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

/** 장착 새 ID 조회 */
export async function getEquippedBirdId(userId: string): Promise<string> {
  const { data } = await supabase
    .from("user")
    .select("equipped_bird_id")
    .eq("id", userId)
    .single();

  return data?.equipped_bird_id ?? "bird_common_1";
}

// ==================== 점수 ====================

/** 최고 점수 조회 */
export async function getHighScore(userId: string): Promise<number> {
  const { data } = await supabase
    .from("user")
    .select("high_score")
    .eq("id", userId)
    .single();

  return data?.high_score ?? 0;
}

/** 최고 점수 갱신 (현재보다 높을 때만) */
export async function updateHighScore(
  userId: string,
  score: number
): Promise<void> {
  const current = await getHighScore(userId);
  if (score > current) {
    await supabase
      .from("user")
      .update({ high_score: score, updated_at: new Date().toISOString() })
      .eq("id", userId);
  }
}

/** 게임 플레이 로그 저장 */
export async function saveGameScore(
  userId: string,
  mode: "record" | "stage",
  score: number,
  coinsEarned: number,
  stageId?: number
): Promise<void> {
  await supabase.from("game_score").insert({
    user_id: userId,
    mode,
    stage_id: stageId ?? null,
    score,
    coins_earned: coinsEarned,
  });
}

// ==================== 스테이지 기록 ====================

/** 전체 스테이지 기록 조회 */
export async function getStageRecords(
  userId: string
): Promise<Record<number, { bestPercent: number; cleared: boolean }>> {
  const { data } = await supabase
    .from("user_stage_record")
    .select("stage_id, best_percent, cleared")
    .eq("user_id", userId);

  const records: Record<number, { bestPercent: number; cleared: boolean }> = {};
  if (data) {
    for (const row of data) {
      records[row.stage_id] = {
        bestPercent: row.best_percent,
        cleared: row.cleared,
      };
    }
  }
  return records;
}

/** 특정 스테이지 최고 기록 조회 */
export async function getStageBest(
  userId: string,
  stageId: number
): Promise<number> {
  const { data } = await supabase
    .from("user_stage_record")
    .select("best_percent")
    .eq("user_id", userId)
    .eq("stage_id", stageId)
    .single();

  return data?.best_percent ?? 0;
}

/** 스테이지 기록 갱신 (UPSERT) */
export async function updateStageBest(
  userId: string,
  stageId: number,
  percent: number
): Promise<void> {
  const current = await getStageBest(userId, stageId);
  if (percent <= current) return; // 기존 기록보다 낮으면 무시

  const cleared = percent >= 100;

  await supabase.from("user_stage_record").upsert(
    {
      user_id: userId,
      stage_id: stageId,
      best_percent: percent,
      cleared,
      cleared_at: cleared ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,stage_id" }
  );
}

// ==================== 계절 테마 ====================

/** 계절 테마 저장 */
export async function updateSeason(
  userId: string,
  season: string
): Promise<void> {
  await supabase
    .from("user")
    .update({ season, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

// ==================== 일일 보상 ====================

/** 일일 보상 수령 */
export async function claimDailyReward(
  userId: string
): Promise<ClaimResult> {
  // 1. 유저 조회
  const { data: user } = await supabase
    .from("user")
    .select("reward_day, last_reward_date, coins")
    .eq("id", userId)
    .single();

  if (!user) return { claimed: false };

  // 2. 오늘 이미 수령했으면 종료
  if (!canClaimToday(user.last_reward_date)) {
    return { claimed: false };
  }

  // 3. 다음 보상 일차
  const nextDay = getNextRewardDay(user.reward_day);
  const reward = getRewardDef(nextDay);

  // 4. 보상 처리
  if (reward.type === "coins") {
    const amount = reward.coins!;
    await addCoins(userId, amount);

    await supabase
      .from("user")
      .update({
        reward_day: nextDay,
        last_reward_date: getTodayKST(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return { claimed: true, day: nextDay, type: "coins", coins: amount };
  }

  // bird 보상
  const ownedIds = await getOwnedBirdIds(userId);
  const bird = pickRandomBird(reward.rarity!, ownedIds);

  if (bird) {
    // 미보유 새 지급
    await addBird(userId, bird.id);

    await supabase
      .from("user")
      .update({
        reward_day: nextDay,
        last_reward_date: getTodayKST(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return { claimed: true, day: nextDay, type: "bird", bird };
  }

  // 모두 보유 → 코인 대체
  const fallbackCoins = BIRD_FALLBACK_COINS[reward.rarity!] ?? 500;
  await addCoins(userId, fallbackCoins);

  await supabase
    .from("user")
    .update({
      reward_day: nextDay,
      last_reward_date: getTodayKST(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return {
    claimed: true,
    day: nextDay,
    type: "bird",
    coins: fallbackCoins,
    isFallback: true,
  };
}
