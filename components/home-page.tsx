/**
 * 홈 화면 (메인 메뉴)
 * - 장착된 새 표시, 게임 시작/새 선택 버튼
 * - 닉네임 변경 모달
 * - 게임 전체 설명 (i) 버튼 + 모달
 * - 일일 보상 모달 (홈 진입 시 미수령 보상 자동 팝업)
 * - 유저 정보 (이름 + 코인), 계절 테마 선택
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Bird, Power, User, Pencil, Info, Gift } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
  UserInfoBar,
} from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { getBirdById } from "@/lib/birds";
import { useUser } from "@/lib/user-context";
import { isUsernameAvailable, updateUsername, claimDailyReward, getOwnedBirdIds } from "@/lib/user-service";
import { canClaimToday } from "@/lib/daily-rewards";
import { playClickSound } from "@/lib/sound";
import DailyRewardModal from "@/components/daily-reward-modal";

export default function HomePage() {
  const router = useRouter();
  const { currentSeason, setCurrentSeason } = useSeason();
  const { user, refreshUser, patchUser } = useUser();

  const [equippedBirdId, setEquippedBirdId] = useState("bird_common_1");

  // 게임 설명 모달 상태
  const [showGameInfo, setShowGameInfo] = useState(false);

  // 일일 보상 모달 상태
  const [showDailyReward, setShowDailyReward] = useState(false);

  // 닉네임 변경 모달 상태
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isChangingName, setIsChangingName] = useState(false);

  useEffect(() => {
    if (user) {
      setEquippedBirdId(user.equipped_bird_id);
      // 일일 보상 수령 가능 여부 체크
      if (canClaimToday(user.last_reward_date)) {
        setShowDailyReward(true);
      }
    }
  }, [user]);

  const equippedBird = getBirdById(equippedBirdId);

  const handleStart = () => {
    playClickSound();
    router.push("/mode-select");
  };

  const handleSelectBird = () => {
    playClickSound();
    router.push("/bird-selection");
  };

  const handleExit = () => {
    playClickSound();
    console.log("Exit");
  };

  // 일일 보상 수령 처리
  const handleClaimDailyReward = async () => {
    if (!user) return { claimed: false as const };
    const result = await claimDailyReward(user.id);
    if (result.claimed) {
      // 낙관적 업데이트: 코인, reward_day, last_reward_date
      const updates: Record<string, unknown> = {
        reward_day: result.day,
        last_reward_date: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10),
      };
      if (result.coins) {
        updates.coins = (user.coins ?? 0) + result.coins;
      }
      patchUser(updates);
      // DB 동기화
      await refreshUser();
    }
    return result;
  };

  // 닉네임 변경 모달 열기
  const openNameModal = () => {
    setNewName(user?.username ?? "");
    setNameError("");
    setShowNameModal(true);
  };

  // 닉네임 변경 처리
  const handleChangeName = async () => {
    playClickSound();
    setNameError("");
    const trimmed = newName.trim();

    if (!trimmed) {
      setNameError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    if (trimmed.length > 12) {
      setNameError("닉네임은 12자 이하여야 합니다.");
      return;
    }
    if (trimmed === user?.username) {
      setShowNameModal(false);
      return;
    }

    setIsChangingName(true);
    try {
      const available = await isUsernameAvailable(trimmed);
      if (!available) {
        setNameError("이미 사용 중인 닉네임입니다.");
        setIsChangingName(false);
        return;
      }

      const success = await updateUsername(user!.id, trimmed);
      if (!success) {
        setNameError("변경에 실패했습니다.");
        setIsChangingName(false);
        return;
      }

      patchUser({ username: trimmed });
      setShowNameModal(false);
    } catch {
      setNameError("오류가 발생했습니다.");
    } finally {
      setIsChangingName(false);
    }
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 상단 헤더 */}
      <div className="relative z-20 px-3 pt-2 pb-1">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => { playClickSound(); setShowGameInfo(true); }}
            className="p-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 transition-all"
            aria-label="게임 설명"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
          <SeasonSelector
            currentSeason={currentSeason}
            onSeasonChange={setCurrentSeason}
          />
        </div>

        <div className="flex justify-end">
          <UserInfoBar onEditUsername={openNameModal} />
        </div>

        <div className="flex justify-end mt-1">
          <button
            onClick={() => { playClickSound(); setShowDailyReward(true); }}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400/80 to-yellow-400/80 hover:from-orange-400 hover:to-yellow-400 active:from-orange-500 active:to-yellow-500 backdrop-blur-sm rounded-lg border border-white/30 transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[10px] font-bold">일일보상</span>
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-1">
          {equippedBird?.imagePath === "svg" ? (
            <FlappyBird className="w-12 h-12 drop-shadow-lg" />
          ) : equippedBird?.imagePath ? (
            <Image
              src={equippedBird.imagePath}
              alt={equippedBird.nameKo}
              width={48}
              height={33}
              className="drop-shadow-lg object-contain"
            />
          ) : (
            <FlappyBird className="w-12 h-12 drop-shadow-lg" />
          )}
        </div>

        <h1
          className="text-2xl font-bold text-white mb-0.5 tracking-wider"
          style={{
            textShadow:
              "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,255,255,0.1)",
          }}
        >
          FLAPPY BIRD
        </h1>
        <p
          className="text-white/90 mb-3 text-sm"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          하늘을 날아라!
        </p>

        <div className="w-full max-w-[240px] space-y-1.5">
          <button
            onClick={handleStart}
            className="w-full py-2 bg-[#4CAF50] hover:bg-[#43A047] active:bg-[#388E3C] text-white text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            START
          </button>

          <button
            onClick={handleSelectBird}
            className="w-full py-2 bg-[#2196F3] hover:bg-[#1E88E5] active:bg-[#1976D2] text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Bird className="w-4 h-4" />
            SELECT BIRD
          </button>

          <button
            onClick={handleExit}
            className="w-full py-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-bold rounded-xl transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center gap-1.5"
          >
            <Power className="w-3.5 h-3.5" />
            EXIT
          </button>
        </div>
      </div>

      {/* 일일 보상 모달 */}
      {showDailyReward && user && (
        <DailyRewardModal
          currentDay={user.reward_day}
          canClaim={canClaimToday(user.last_reward_date)}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyReward(false)}
        />
      )}

      {/* 게임 설명 모달 */}
      {showGameInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 max-h-[90%] overflow-y-auto overflow-hidden">
            <div className="bg-[#4CAF50] py-2">
              <h2 className="text-white text-sm font-bold text-center">
                게임 설명
              </h2>
            </div>
            <div className="p-3 space-y-2">
              <Image
                src="/images/game_explanation/homescreen.png"
                alt="홈 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="text-xs text-gray-700 space-y-1.5">
                <p className="font-bold text-green-600">Flappy Bird에 오신 것을 환영합니다!</p>
                <p>화면을 <span className="font-bold">탭</span>하여 새를 조종하세요.</p>
                <p>파이프 사이를 통과하며 점수를 획득합니다.</p>
              </div>

              <Image
                src="/images/game_explanation/selectmode.png"
                alt="모드 선택 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="text-xs text-gray-700 space-y-1.5">
                <div className="bg-orange-50 rounded-lg p-2 space-y-1">
                  <p className="font-bold text-orange-600">RECORD MODE</p>
                  <p>끝없는 도전! 최고 점수를 갱신하세요.</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 space-y-1">
                  <p className="font-bold text-indigo-600">STAGE MODE</p>
                  <p>스테이지별 목표를 클리어하며 진행!</p>
                </div>
              </div>

              <Image
                src="/images/game_explanation/birdselection.png"
                alt="새 선택 화면"
                width={224}
                height={400}
                className="w-full rounded-lg border border-gray-200"
              />
              <div className="text-xs text-gray-700 space-y-1.5">
                <p className="font-bold text-blue-600">새로운 새를 수집하세요!</p>
                <p>가챠(뽑기)로 새로운 새를 획득할 수 있습니다.</p>
                <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                  <p className="font-bold text-gray-600">새 등급</p>
                  <p>⬜ Common · 🟦 Rare · 🟪 Epic · 🟨 Unique</p>
                </div>
              </div>

              <div className="text-xs text-gray-700 space-y-1.5">
                <div className="bg-amber-50 rounded-lg p-2 space-y-1.5">
                  <p className="font-bold text-amber-600">🎁 일일 보상 (Daily Reward)</p>
                  <p>매일 홈 화면 접속 시 보상을 받을 수 있습니다!</p>
                  <p>7일 주기로 보상이 순환됩니다.</p>
                  <div className="bg-white/60 rounded p-1.5 space-y-0.5 text-[10px]">
                    <p>Day 1: 💰 200 코인</p>
                    <p>Day 2: 💰 300 코인</p>
                    <p>Day 3: 🟦 레어 새 (랜덤)</p>
                    <p>Day 4: 💰 500 코인</p>
                    <p>Day 5: 🟪 에픽 새 (랜덤)</p>
                    <p>Day 6: 💰 700 코인</p>
                    <p>Day 7: 🟨 유니크 새 (랜덤)</p>
                  </div>
                  <p className="text-[10px] text-gray-500">※ 해당 등급 새를 모두 보유 시 코인으로 대체됩니다.</p>
                </div>
              </div>

              <button
                onClick={() => { playClickSound(); setShowGameInfo(false); }}
                className="w-full py-2 bg-[#4CAF50] hover:bg-[#43A047] active:bg-[#388E3C] text-white text-sm font-bold rounded-lg transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 닉네임 변경 모달 */}
      {showNameModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 max-h-[90%] overflow-y-auto overflow-hidden">
            <div className="bg-[#FF9800] py-2">
              <h2 className="text-white text-sm font-bold text-center">
                닉네임 변경
              </h2>
            </div>
            <div className="p-3 space-y-2">
              {nameError && (
                <div className="p-1.5 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs">
                  {nameError}
                </div>
              )}

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="새 닉네임"
                  autoComplete="off"
                  maxLength={12}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={isChangingName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChangeName();
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                />
              </div>

              <p className="text-[10px] text-gray-400 text-center">2~12자</p>

              <div className="flex gap-2">
                <button
                  onClick={() => { playClickSound(); setShowNameModal(false); }}
                  disabled={isChangingName}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-sm font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleChangeName}
                  disabled={isChangingName}
                  className="flex-1 py-2 bg-[#FF9800] hover:bg-[#F57C00] active:bg-[#EF6C00] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {isChangingName ? "확인 중..." : "변경"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SeasonalBackground>
  );
}
