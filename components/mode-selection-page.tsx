/**
 * 모드 선택 페이지
 * - RECORD MODE: 무한 모드 → /game
 * - STAGE MODE: 스테이지 모드 → /stage-select
 */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Map } from "lucide-react";
import { SeasonalBackground } from "@/components/ui";
import { useSeason } from "@/lib/season-context";

export default function ModeSelectionPage() {
  const router = useRouter();
  const { currentSeason } = useSeason();

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 상단 헤더 */}
      <div className="relative z-20 px-3 pt-2 pb-1">
        <button
          onClick={() => router.push("/home")}
          className="p-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 transition-all"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 타이틀 */}
      <div className="relative z-10 text-center mb-1">
        <h1
          className="text-lg font-bold text-white tracking-wider"
          style={{
            textShadow:
              "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,255,255,0.1)",
          }}
        >
          SELECT MODE
        </h1>
      </div>

      {/* 모드 카드 영역 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-2">
        <div className="flex gap-3 w-full max-w-md">
          {/* RECORD MODE 카드 */}
          <div className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-xl border-2 border-orange-400/50 bg-gradient-to-b from-orange-500/80 to-red-600/80 backdrop-blur-sm">
            <div className="flex items-center justify-center py-2 bg-gradient-to-b from-orange-400/30 to-transparent">
              <div className="w-10 h-10 rounded-full bg-orange-300/30 flex items-center justify-center border-2 border-orange-200/40">
                <Trophy className="w-5 h-5 text-yellow-200 drop-shadow-md" />
              </div>
            </div>

            <div className="text-center px-2">
              <h2
                className="text-sm font-bold text-white tracking-wide leading-tight"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                RECORD MODE
              </h2>
            </div>

            <div className="flex-1" />

            <div className="p-2 pt-0">
              <button
                onClick={() => router.push("/game")}
                className="w-full py-2 bg-orange-400 hover:bg-orange-300 active:bg-orange-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              >
                PLAY
              </button>
            </div>
          </div>

          {/* STAGE MODE 카드 */}
          <div className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-xl border-2 border-indigo-400/50 bg-gradient-to-b from-blue-500/80 to-purple-600/80 backdrop-blur-sm">
            <div className="flex items-center justify-center py-2 bg-gradient-to-b from-blue-400/30 to-transparent">
              <div className="w-10 h-10 rounded-full bg-blue-300/30 flex items-center justify-center border-2 border-blue-200/40">
                <Map className="w-5 h-5 text-blue-200 drop-shadow-md" />
              </div>
            </div>

            <div className="text-center px-2">
              <h2
                className="text-sm font-bold text-white tracking-wide leading-tight"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                STAGE MODE
              </h2>
            </div>

            <div className="flex-1" />

            <div className="p-2 pt-0">
              <button
                onClick={() => router.push("/stage-select")}
                className="w-full py-2 bg-indigo-400 hover:bg-indigo-300 active:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </SeasonalBackground>
  );
}
