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
      <div className="relative z-20 px-4 pt-4 pb-2">
        <button
          onClick={() => router.push("/home")}
          className="p-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 transition-all"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 타이틀 */}
      <div className="relative z-10 text-center mt-4 mb-6">
        <h1
          className="text-3xl font-bold text-white tracking-wider"
          style={{
            textShadow:
              "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,255,255,0.1)",
          }}
        >
          SELECT MODE
        </h1>
      </div>

      {/* 모드 카드 영역 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="flex gap-4 w-full max-w-lg">
          {/* RECORD MODE 카드 */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-xl border-2 border-orange-400/50 bg-gradient-to-b from-orange-500/80 to-red-600/80 backdrop-blur-sm">
            {/* 아이콘 영역 */}
            <div className="flex items-center justify-center py-8 bg-gradient-to-b from-orange-400/30 to-transparent">
              <div className="w-20 h-20 rounded-full bg-orange-300/30 flex items-center justify-center border-2 border-orange-200/40">
                <Trophy className="w-10 h-10 text-yellow-200 drop-shadow-md" />
              </div>
            </div>

            {/* 모드 제목 */}
            <div className="text-center px-3">
              <h2
                className="text-xl font-bold text-white tracking-wide"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                RECORD
              </h2>
              <h2
                className="text-xl font-bold text-white tracking-wide mb-2"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                MODE
              </h2>
            </div>

            {/* 설명 영역 */}
            <div className="flex-1 px-3 py-2">
              <p className="text-white/70 text-xs text-center leading-relaxed">
                {/* 추후 설명 텍스트 추가 */}
              </p>
            </div>

            {/* PLAY 버튼 */}
            <div className="p-3 pt-0">
              <button
                onClick={() => router.push("/game")}
                className="w-full py-3 bg-orange-400 hover:bg-orange-300 active:bg-orange-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              >
                PLAY
              </button>
            </div>
          </div>

          {/* STAGE MODE 카드 */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-xl border-2 border-indigo-400/50 bg-gradient-to-b from-blue-500/80 to-purple-600/80 backdrop-blur-sm">
            {/* 아이콘 영역 */}
            <div className="flex items-center justify-center py-8 bg-gradient-to-b from-blue-400/30 to-transparent">
              <div className="w-20 h-20 rounded-full bg-blue-300/30 flex items-center justify-center border-2 border-blue-200/40">
                <Map className="w-10 h-10 text-blue-200 drop-shadow-md" />
              </div>
            </div>

            {/* 모드 제목 */}
            <div className="text-center px-3">
              <h2
                className="text-xl font-bold text-white tracking-wide"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                STAGE
              </h2>
              <h2
                className="text-xl font-bold text-white tracking-wide mb-2"
                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
              >
                MODE
              </h2>
            </div>

            {/* 설명 영역 */}
            <div className="flex-1 px-3 py-2">
              <p className="text-white/70 text-xs text-center leading-relaxed">
                {/* 추후 설명 텍스트 추가 */}
              </p>
            </div>

            {/* PLAY 버튼 */}
            <div className="p-3 pt-0">
              <button
                onClick={() => router.push("/stage-select")}
                className="w-full py-3 bg-indigo-400 hover:bg-indigo-300 active:bg-indigo-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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
