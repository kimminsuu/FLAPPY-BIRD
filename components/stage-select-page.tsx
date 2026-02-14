"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { SeasonalBackground } from "@/components/ui";
import { Season } from "@/components/ui/SeasonalBackground";
import { useSeason } from "@/lib/season-context";

const TOTAL_STAGES = 15;
const COLUMNS = 5;

/** 계절별 오픈 스테이지 카드 스타일 (배경과 어울리는 색상) */
const SEASON_STAGE_STYLE: Record<Season, { gradient: string; text: string }> = {
  spring: {
    gradient: "from-pink-300 to-rose-400",       // 벚꽃빛 파스텔 핑크
    text: "text-white",
  },
  summer: {
    gradient: "from-cyan-400 to-sky-500",        // 청량한 하늘/바다색
    text: "text-white",
  },
  autumn: {
    gradient: "from-amber-400 to-orange-500",    // 따뜻한 노을/단풍색
    text: "text-white",
  },
  winter: {
    gradient: "from-slate-300 to-blue-300",      // 차가운 얼음/서리색
    text: "text-white",
  },
};

interface StageCardProps {
  stage: number;
  isUnlocked: boolean;
  stageStyle: { gradient: string; text: string };
  bestPercent: number;
  onClick: () => void;
}

function StageCard({ stage, isUnlocked, stageStyle, bestPercent, onClick }: StageCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`
        relative flex-shrink-0 w-28 h-36 rounded-2xl transition-all duration-200
        flex flex-col items-center justify-center
        ${isUnlocked
          ? `bg-gradient-to-br ${stageStyle.gradient} shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`
          : "bg-gray-200/70"
        }
      `}
    >
      {isUnlocked ? (
        <>
          <span
            className="text-3xl font-black text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            {stage}
          </span>

          {/* 최고 기록 뱃지 */}
          {bestPercent > 0 && (
            <div className={`
              absolute bottom-2 left-1/2 -translate-x-1/2
              px-2 py-0.5 rounded-full text-xs font-bold
              ${bestPercent >= 100
                ? "bg-yellow-400 text-yellow-900"
                : "bg-white/30 text-white"
              }
            `}>
              {bestPercent >= 100 ? (
                <span className="flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  100%
                </span>
              ) : (
                `${bestPercent}%`
              )}
            </div>
          )}
        </>
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-300 rounded-full">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
      )}

      {/* 잠금 오버레이 */}
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-2xl bg-black/20" />
      )}
    </button>
  );
}

export default function StageSelectPage() {
  const router = useRouter();
  const { currentSeason } = useSeason();
  const [bestRecords, setBestRecords] = useState<Record<string, number>>({});

  // 유저별 스테이지 최고 기록 로드
  useEffect(() => {
    try {
      let username = "";
      try {
        username = JSON.parse(localStorage.getItem("flappy_auth_user") || "{}").username || "";
      } catch { /* ignore */ }
      if (!username) return;
      const raw = localStorage.getItem(`flappy_stage_best_${username}`);
      if (raw) {
        setBestRecords(JSON.parse(raw));
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  // 스테이지를 행별로 나누기 (3행 x 5열)
  const stages = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < stages.length; i += COLUMNS) {
    rows.push(stages.slice(i, i + COLUMNS));
  }

  const stageStyle = SEASON_STAGE_STYLE[currentSeason];

  // 스테이지 잠금 해제 판정: Stage 1은 항상 오픈, N단계는 N-1단계 100% 클리어 시 해제
  const isStageUnlocked = (stage: number): boolean => {
    if (stage === 1) return true;
    return (bestRecords[String(stage - 1)] ?? 0) >= 100;
  };

  const handleStageClick = (stage: number) => {
    router.push(`/stage/${stage}`);
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 헤더 */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => router.push("/mode-select")}
          className="p-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 transition-all"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1
          className="text-2xl font-bold text-white"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          STAGE SELECT
        </h1>
        <div className="w-10" />
      </div>

      {/* 스테이지 격자 (3행 x 5열) */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col gap-3">
          {rows.map((rowStages, rowIndex) => (
            <div key={rowIndex} className="flex gap-3 justify-center">
              {rowStages.map((stage) => (
                <StageCard
                  key={stage}
                  stage={stage}
                  isUnlocked={isStageUnlocked(stage)}
                  stageStyle={stageStyle}
                  bestPercent={bestRecords[String(stage)] ?? 0}
                  onClick={() => handleStageClick(stage)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SeasonalBackground>
  );
}
