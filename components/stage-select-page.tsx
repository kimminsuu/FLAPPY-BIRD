"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { SeasonalBackground } from "@/components/ui";
import { Season } from "@/components/ui/SeasonalBackground";
import { useSeason } from "@/lib/season-context";
import { useUser } from "@/lib/user-context";
import { getStageRecords } from "@/lib/user-service";

const TOTAL_STAGES = 15;
const COLUMNS = 5;

const SEASON_STAGE_STYLE: Record<Season, { gradient: string; text: string }> = {
  spring: {
    gradient: "from-pink-300 to-rose-400",
    text: "text-white",
  },
  summer: {
    gradient: "from-cyan-400 to-sky-500",
    text: "text-white",
  },
  autumn: {
    gradient: "from-amber-400 to-orange-500",
    text: "text-white",
  },
  winter: {
    gradient: "from-slate-300 to-blue-300",
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
        relative flex-shrink-0 w-16 h-20 rounded-xl transition-all duration-200
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
            className="text-xl font-black text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            {stage}
          </span>

          {bestPercent > 0 && (
            <div className={`
              absolute bottom-1 left-1/2 -translate-x-1/2
              px-1.5 py-0.5 rounded-full text-[10px] font-bold
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
        <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full">
          <Lock className="w-5 h-5 text-gray-500" />
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute inset-0 rounded-2xl bg-black/20" />
      )}
    </button>
  );
}

export default function StageSelectPage() {
  const router = useRouter();
  const { currentSeason } = useSeason();
  const { user } = useUser();
  const [bestRecords, setBestRecords] = useState<Record<string, number>>({});

  // Supabase에서 스테이지 기록 로드
  useEffect(() => {
    if (!user) return;
    getStageRecords(user.id).then((records) => {
      const mapped: Record<string, number> = {};
      for (const [stageId, rec] of Object.entries(records)) {
        mapped[stageId] = rec.bestPercent;
      }
      setBestRecords(mapped);
    });
  }, [user]);

  const stages = Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < stages.length; i += COLUMNS) {
    rows.push(stages.slice(i, i + COLUMNS));
  }

  const stageStyle = SEASON_STAGE_STYLE[currentSeason];

  const isStageUnlocked = (stage: number): boolean => {
    if (stage === 1) return true;
    return (bestRecords[String(stage - 1)] ?? 0) >= 100;
  };

  const handleStageClick = (stage: number) => {
    router.push(`/stage/${stage}`);
  };

  return (
    <SeasonalBackground season={currentSeason}>
      <div className="relative z-20 flex items-center justify-between px-3 pt-2 pb-1">
        <button
          onClick={() => router.push("/mode-select")}
          className="p-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 transition-all"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1
          className="text-lg font-bold text-white"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          STAGE SELECT
        </h1>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-3">
        <div className="flex flex-col gap-1.5">
          {rows.map((rowStages, rowIndex) => (
            <div key={rowIndex} className="flex gap-1.5 justify-center">
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
