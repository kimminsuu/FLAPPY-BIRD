"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trophy, LogOut, Bird, Power } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
} from "@/components/ui";
import { useSeason } from "@/lib/season-context";

export default function HomePage() {
  const router = useRouter();
  const { currentSeason, setCurrentSeason } = useSeason();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleStart = () => {
    // TODO: GameScreen으로 이동
    console.log("Start game");
  };

  const handleSelectBird = () => {
    // TODO: BirdSelectionScreen으로 이동
    console.log("Select bird");
  };

  const handleRanking = () => {
    // TODO: RankingScreen으로 이동
    console.log("Ranking");
  };

  const handleExit = () => {
    // TODO: 앱 종료 또는 로그인 화면으로 이동
    console.log("Exit");
  };

  const handleLogout = () => {
    localStorage.removeItem("flappy_auth_user");
    router.replace("/");
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 배경 선택 버튼 */}
      <SeasonSelector
        currentSeason={currentSeason}
        onSeasonChange={setCurrentSeason}
      />

      {/* 로그아웃 버튼 (좌측 상단) */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="absolute top-4 left-4 z-20 p-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 transition-all"
        aria-label="로그아웃"
      >
        <Power className="w-5 h-5 text-white" />
      </button>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {/* 새 아이콘 */}
        <div className="mb-4">
          <FlappyBird className="w-28 h-28 drop-shadow-lg" />
        </div>

        {/* 타이틀 */}
        <h1
          className="text-5xl font-bold text-white mb-1 tracking-wider"
          style={{
            textShadow:
              "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,255,255,0.1)",
          }}
        >
          FLAPPY BIRD
        </h1>
        <p
          className="text-white/90 mb-12 text-lg"
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          하늘을 날아라!
        </p>

        {/* 메뉴 버튼 */}
        <div className="w-full max-w-xs space-y-3">
          {/* START 버튼 - 가장 크고 눈에 띄게 */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#4CAF50] hover:bg-[#43A047] active:bg-[#388E3C] text-white text-xl font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Play className="w-7 h-7 fill-current" />
            START
          </button>

          {/* SELECT BIRD 버튼 */}
          <button
            onClick={handleSelectBird}
            className="w-full py-3.5 bg-[#2196F3] hover:bg-[#1E88E5] active:bg-[#1976D2] text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Bird className="w-6 h-6" />
            SELECT BIRD
          </button>

          {/* RANKING 버튼 */}
          <button
            onClick={handleRanking}
            className="w-full py-3.5 bg-[#FFC107] hover:bg-[#FFB300] active:bg-[#FFA000] text-[#3E2723] text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Trophy className="w-6 h-6" />
            RANKING
          </button>

          {/* EXIT 버튼 */}
          <button
            onClick={handleExit}
            className="w-full py-3 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-base font-bold rounded-2xl transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            EXIT
          </button>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
            <div className="bg-[#E53935] py-4">
              <h2 className="text-white text-lg font-bold text-center">
                로그아웃
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6">
                정말 로그아웃하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold rounded-xl transition-all"
                >
                  아니오
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-[#E53935] hover:bg-[#D32F2F] active:bg-[#C62828] text-white font-bold rounded-xl transition-all"
                >
                  예
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SeasonalBackground>
  );
}
