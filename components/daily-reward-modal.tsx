/**
 * 일일 보상 모달 (Daily Reward Modal)
 * - 7일 주기 보상 캘린더 그리드
 * - 코인 보상: 카운트업 애니메이션 + 금색 플래시
 * - 새 보상: "?" 카드 떨림 → 카드 플립 → 등급 색상 공개 + "NEW!" 배지
 * - 모든 새 보유 시 코인 대체 연출
 * - phase: "idle" → "animating" → "result"
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Coins, Gift, Lock, Check, Sparkles } from "lucide-react";
import { FlappyBird } from "@/components/ui";
import {
  DAILY_REWARDS,
  getNextRewardDay,
  type ClaimResult,
  type DailyRewardDef,
} from "@/lib/daily-rewards";
import { BIRD_RARITY_INFO } from "@/types/bird";
import { playClickSound } from "@/lib/sound";

/** 파티클 위치 (결정론적, 렌더 중 Math.random 금지) */
const SPARKLE_POSITIONS = [
  { left: 20, top: 15 },
  { left: 75, top: 25 },
  { left: 35, top: 50 },
  { left: 60, top: 10 },
  { left: 45, top: 65 },
  { left: 80, top: 45 },
  { left: 25, top: 35 },
  { left: 55, top: 55 },
];

type Phase = "idle" | "animating" | "result";

interface DailyRewardModalProps {
  /** 현재 유저의 reward_day (마지막 수령 일차, 0=미수령) */
  currentDay: number;
  /** 오늘 수령 가능 여부 */
  canClaim: boolean;
  /** 보상 수령 처리 (서버 호출) */
  onClaim: () => Promise<ClaimResult>;
  /** 모달 닫기 */
  onClose: () => void;
}

export default function DailyRewardModal({
  currentDay,
  canClaim,
  onClaim,
  onClose,
}: DailyRewardModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [countUp, setCountUp] = useState(0);

  const todayDay = getNextRewardDay(currentDay);

  // 코인 카운트업 애니메이션
  useEffect(() => {
    if (phase !== "result" || !result || result.type !== "coins" || !result.coins)
      return;

    const target = result.coins;
    const duration = 500;
    const steps = 20;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCountUp(target);
        clearInterval(timer);
      } else {
        setCountUp(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [phase, result]);

  const handleClaim = useCallback(async () => {
    playClickSound();
    setPhase("animating");

    const claimResult = await onClaim();

    if (!claimResult.claimed) {
      setPhase("idle");
      return;
    }

    setResult(claimResult);

    // 연출 딜레이 후 결과 표시
    const delay = claimResult.type === "bird" && !claimResult.isFallback ? 1500 : 800;
    setTimeout(() => {
      setPhase("result");
    }, delay);
  }, [onClaim]);

  const handleClose = useCallback(() => {
    playClickSound();
    setPhase("idle");
    setResult(null);
    onClose();
  }, [onClose]);

  /** 각 Day 칸의 상태 판별 */
  const getDayStatus = (day: number): "claimed" | "today" | "future" => {
    // 7일 완료 후 새 주기: 전부 미수령
    const isNewCycle = currentDay === 7 && canClaim;
    if (isNewCycle) {
      if (day === todayDay) return "today"; // todayDay=1
      return "future";
    }

    // 1~currentDay까지는 수령 완료
    if (day <= currentDay) return "claimed";
    // 다음 수령 대상
    if (day === todayDay && canClaim) return "today";
    return "future";
  };

  /** Day 칸 아이콘 */
  const renderDayIcon = (reward: DailyRewardDef, status: string) => {
    if (status === "claimed") {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    if (status === "future") {
      return <Lock className="w-3 h-3 text-gray-400" />;
    }
    // today
    if (reward.type === "coins") {
      return <Coins className="w-4 h-4 text-yellow-500" />;
    }
    // bird
    const rarityColor = BIRD_RARITY_INFO[reward.rarity!].color;
    return (
      <Gift className="w-4 h-4" style={{ color: rarityColor }} />
    );
  };

  /** Day 칸 보상 텍스트 */
  const renderDayLabel = (reward: DailyRewardDef) => {
    if (reward.type === "coins") {
      return <span className="text-[9px] text-gray-600 font-medium">{reward.coins}</span>;
    }
    const info = BIRD_RARITY_INFO[reward.rarity!];
    return (
      <span className="text-[9px] font-medium" style={{ color: info.color }}>
        {info.labelKo}
      </span>
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={phase === "idle" ? handleClose : undefined} />

      <div className="relative z-10 w-72">
        {/* ===== IDLE: 캘린더 + Claim 버튼 ===== */}
        {phase === "idle" && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-orange-400 to-yellow-400 py-3 px-4">
              <h2 className="text-white text-base font-bold text-center tracking-wide"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
                Daily Reward
              </h2>
            </div>

            {/* 7일 그리드 */}
            <div className="p-3">
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {DAILY_REWARDS.map((reward) => {
                  const status = getDayStatus(reward.day);
                  const isToday = status === "today";
                  const isClaimed = status === "claimed";

                  return (
                    <div
                      key={reward.day}
                      className={`
                        relative flex flex-col items-center justify-center py-2 px-1 rounded-lg border-2 transition-all
                        ${isToday
                          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-200"
                          : isClaimed
                            ? "border-green-200 bg-green-50/50 opacity-60"
                            : "border-gray-200 bg-gray-50 opacity-50"
                        }
                      `}
                    >
                      {/* 오늘 강조 */}
                      {isToday && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                          <span className="px-1.5 py-0.5 bg-orange-400 text-white text-[8px] font-bold rounded-full">
                            TODAY
                          </span>
                        </div>
                      )}

                      <span className="text-[10px] text-gray-400 font-medium mb-0.5">
                        Day {reward.day}
                      </span>
                      {renderDayIcon(reward, status)}
                      {renderDayLabel(reward)}
                    </div>
                  );
                })}
              </div>

              {/* Claim 버튼 또는 수령 완료 안내 */}
              {canClaim ? (
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 active:from-orange-600 active:to-yellow-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Claim!
                </button>
              ) : (
                <button
                  onClick={() => { playClickSound(); onClose(); }}
                  className="w-full py-2.5 bg-gray-300 text-gray-500 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  오늘 수령 완료
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== ANIMATING ===== */}
        {phase === "animating" && (
          <div className="flex flex-col items-center">
            {/* "?" 카드 (새 보상) 또는 코인 스피너 */}
            <div className="relative">
              <div className="w-28 h-32 bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 rounded-xl shadow-2xl flex items-center justify-center animate-pulse">
                <div className="absolute inset-0 rounded-xl animate-spin-slow bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                <span className="text-4xl font-bold text-white" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                  ?
                </span>
              </div>
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-300 rounded-full animate-ping opacity-75" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-orange-300 rounded-full animate-ping opacity-75" />
            </div>
            <p className="mt-3 text-white text-sm font-bold animate-pulse">
              보상 수령 중...
            </p>
          </div>
        )}

        {/* ===== RESULT ===== */}
        {phase === "result" && result && (
          <div className="flex flex-col items-center">
            {/* 코인 보상 (직접 코인 또는 대체 코인) */}
            {(result.type === "coins" || result.isFallback) && (
              <div className="flex flex-col items-center">
                {/* 금색 플래시 배경 */}
                <div className="relative w-36 h-40 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 rounded-2xl shadow-2xl flex flex-col items-center justify-center overflow-hidden animate-flip-in">
                  {/* 반짝이 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />

                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[10px] text-white/80 font-medium mb-1">
                      Day {result.day}
                    </span>
                    <Coins className="w-10 h-10 text-yellow-100 drop-shadow-lg mb-1" />
                    <span className="text-2xl font-bold text-white" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                      +{countUp}
                    </span>
                    {result.isFallback && (
                      <span className="mt-1 px-2 py-0.5 bg-white/30 rounded-full text-[9px] text-white font-medium">
                        모두 보유 (코인 대체)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-3 w-36 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            )}

            {/* 새 보상 */}
            {result.type === "bird" && !result.isFallback && result.bird && (
              <div className="flex flex-col items-center">
                <div
                  className="relative w-36 h-44 rounded-xl shadow-2xl overflow-hidden animate-flip-in"
                  style={{
                    backgroundColor: BIRD_RARITY_INFO[result.bird.rarity].bgColor,
                    borderWidth: "3px",
                    borderColor: BIRD_RARITY_INFO[result.bird.rarity].color,
                  }}
                >
                  {/* 등급 배경 글로우 */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${BIRD_RARITY_INFO[result.bird.rarity].color}40, transparent 70%)`,
                    }}
                  />

                  {/* NEW 배지 */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-xs shadow-lg animate-bounce">
                      NEW!
                    </span>
                  </div>

                  {/* Day 표시 */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-1.5 py-0.5 bg-black/20 text-white text-[9px] font-medium rounded-full">
                      Day {result.day}
                    </span>
                  </div>

                  {/* 새 이미지 */}
                  <div className="flex items-center justify-center h-24 pt-6">
                    {result.bird.imagePath === "svg" ? (
                      <FlappyBird className="w-16 h-16 drop-shadow-lg" />
                    ) : (
                      <Image
                        src={result.bird.imagePath}
                        alt={result.bird.nameKo}
                        width={64}
                        height={44}
                        className="object-contain drop-shadow-lg"
                      />
                    )}
                  </div>

                  {/* 이름 + 등급 */}
                  <div className="px-2 pb-2 text-center">
                    <p
                      className="text-base font-bold"
                      style={{ color: BIRD_RARITY_INFO[result.bird.rarity].color }}
                    >
                      {result.bird.nameKo}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: BIRD_RARITY_INFO[result.bird.rarity].color }}
                    >
                      {BIRD_RARITY_INFO[result.bird.rarity].labelKo}
                    </p>
                  </div>
                </div>

                {/* 반짝이 파티클 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {SPARKLE_POSITIONS.map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full animate-sparkle"
                      style={{
                        backgroundColor: BIRD_RARITY_INFO[result.bird!.rarity].color,
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  className="mt-3 w-36 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
