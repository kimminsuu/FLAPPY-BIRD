/**
 * 모드 선택 페이지
 * - RECORD MODE: 무한 모드 → /game
 * - STAGE MODE: 스테이지 모드 → /stage-select
 * - 각 모드 카드에 (i) 버튼 → 모드별 설명 모달
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Trophy, Map, Info } from "lucide-react";
import { SeasonalBackground } from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { playClickSound } from "@/lib/sound";

export default function ModeSelectionPage() {
  const router = useRouter();
  const { currentSeason } = useSeason();
  const [showRecordInfo, setShowRecordInfo] = useState(false);
  const [showStageInfo, setShowStageInfo] = useState(false);

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 상단 헤더 */}
      <div className="relative z-20 px-3 pt-2 pb-1">
        <button
          onClick={() => { playClickSound(); router.push("/home"); }}
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
            <div className="relative flex items-center justify-center py-2 bg-gradient-to-b from-orange-400/30 to-transparent">
              <div className="w-10 h-10 rounded-full bg-orange-300/30 flex items-center justify-center border-2 border-orange-200/40">
                <Trophy className="w-5 h-5 text-yellow-200 drop-shadow-md" />
              </div>
              <button
                onClick={() => { playClickSound(); setShowRecordInfo(true); }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-full transition-all"
                aria-label="레코드 모드 설명"
              >
                <Info className="w-4 h-4 text-white" />
              </button>
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
                onClick={() => { playClickSound(); router.push("/game"); }}
                className="w-full py-2 bg-orange-400 hover:bg-orange-300 active:bg-orange-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              >
                PLAY
              </button>
            </div>
          </div>

          {/* STAGE MODE 카드 */}
          <div className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-xl border-2 border-indigo-400/50 bg-gradient-to-b from-blue-500/80 to-purple-600/80 backdrop-blur-sm">
            <div className="relative flex items-center justify-center py-2 bg-gradient-to-b from-blue-400/30 to-transparent">
              <div className="w-10 h-10 rounded-full bg-blue-300/30 flex items-center justify-center border-2 border-blue-200/40">
                <Map className="w-5 h-5 text-blue-200 drop-shadow-md" />
              </div>
              <button
                onClick={() => { playClickSound(); setShowStageInfo(true); }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-full transition-all"
                aria-label="스테이지 모드 설명"
              >
                <Info className="w-4 h-4 text-white" />
              </button>
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
                onClick={() => { playClickSound(); router.push("/stage-select"); }}
                className="w-full py-2 bg-indigo-400 hover:bg-indigo-300 active:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* RECORD MODE 설명 모달 */}
      {showRecordInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 max-h-[90%] overflow-y-auto overflow-hidden">
            <div className="bg-[#FF9800] py-2">
              <h2 className="text-white text-sm font-bold text-center">
                RECORD MODE
              </h2>
            </div>
            <div className="p-3 space-y-2">
              <Image
                src="/images/game_explanation/recordmodegame.png"
                alt="레코드 모드 게임 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="text-xs text-gray-700 space-y-1.5">
                <p className="font-bold text-orange-600">끝없이 나는 도전 모드!</p>
                <p>파이프를 통과할 때마다 <span className="font-bold">+1점</span></p>
                <p>최고 점수 갱신을 목표로 도전하세요.</p>
                <div className="bg-orange-50 rounded-lg p-2 space-y-1">
                  <p className="font-bold text-orange-600">새 등급별 아이템 드롭</p>
                  <p>• Rare: 15초마다</p>
                  <p>• Epic: 11초마다</p>
                  <p>• Unique: 7초마다</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                  <p className="font-bold text-gray-600">아이템 종류</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm" style={{ background: "rgba(239, 68, 68, 0.9)" }}>💥</span>
                    <span>파이프 파괴</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm" style={{ background: "rgba(168, 85, 247, 0.9)" }}>👻</span>
                    <span>무적</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm" style={{ background: "rgba(234, 179, 8, 0.9)" }}>⭐</span>
                    <span>가산점 (+5)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { playClickSound(); setShowRecordInfo(false); }}
                className="w-full py-2 bg-[#FF9800] hover:bg-[#F57C00] active:bg-[#EF6C00] text-white text-sm font-bold rounded-lg transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE MODE 설명 모달 */}
      {showStageInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 max-h-[90%] overflow-y-auto overflow-hidden">
            <div className="bg-[#3F51B5] py-2">
              <h2 className="text-white text-sm font-bold text-center">
                STAGE MODE
              </h2>
            </div>
            <div className="p-3 space-y-2">
              <Image
                src="/images/game_explanation/stageselection.png"
                alt="스테이지 선택 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <Image
                src="/images/game_explanation/stagemodegame.png"
                alt="스테이지 모드 게임 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="text-xs text-gray-700 space-y-1.5">
                <p className="font-bold text-indigo-600">스테이지별 목표를 클리어하라!</p>
                <p>목표 파이프 수를 통과하면 <span className="font-bold">클리어</span></p>
                <p>클리어 시 다음 스테이지가 해금됩니다.</p>
                <div className="bg-indigo-50 rounded-lg p-2 space-y-1.5">
                  <p className="font-bold text-indigo-600">스테이지별 고유 기믹</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-5 rounded-[50%] border-[3px]" style={{ borderColor: "#FBBF24", background: "linear-gradient(135deg, rgba(253,224,71,0.3), rgba(245,158,11,0.15))", boxShadow: "0 0 4px rgba(251,191,36,0.4)" }} />
                    <span>텔레포트 포탈</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded text-[10px] font-bold" style={{ background: "rgba(147, 51, 234, 0.15)", color: "rgba(120, 60, 200, 0.8)", border: "1.5px dashed rgba(147, 51, 234, 0.5)" }}>↕</span>
                    <span>중력 반전 존</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-[3px] text-[7px] font-bold" style={{ borderColor: "#4ADE80", color: "#22C55E" }}>S</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-[3px] text-[7px] font-bold" style={{ borderColor: "#EF4444", color: "#DC2626" }}>F</span>
                    <span>속도 변환 링</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-600">최고 기록</p>
                  <p>남은 목숨 수가 최고 기록으로 저장됩니다.</p>
                </div>
              </div>
              <button
                onClick={() => { playClickSound(); setShowStageInfo(false); }}
                className="w-full py-2 bg-[#3F51B5] hover:bg-[#303F9F] active:bg-[#283593] text-white text-sm font-bold rounded-lg transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </SeasonalBackground>
  );
}
