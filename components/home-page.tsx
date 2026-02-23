"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Bird, Power, User, Pencil } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
  UserInfoBar,
} from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { getBirdById } from "@/lib/birds";
import { useUser } from "@/lib/user-context";
import { isUsernameAvailable, updateUsername } from "@/lib/user-service";

export default function HomePage() {
  const router = useRouter();
  const { currentSeason, setCurrentSeason } = useSeason();
  const { user, refreshUser, patchUser } = useUser();

  const [equippedBirdId, setEquippedBirdId] = useState("bird_common_1");

  // 닉네임 변경 모달 상태
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isChangingName, setIsChangingName] = useState(false);

  useEffect(() => {
    if (user) {
      setEquippedBirdId(user.equipped_bird_id);
    }
  }, [user]);

  const equippedBird = getBirdById(equippedBirdId);

  const handleStart = () => {
    router.push("/mode-select");
  };

  const handleSelectBird = () => {
    router.push("/bird-selection");
  };

  const handleExit = () => {
    console.log("Exit");
  };

  // 닉네임 변경 모달 열기
  const openNameModal = () => {
    setNewName(user?.username ?? "");
    setNameError("");
    setShowNameModal(true);
  };

  // 닉네임 변경 처리
  const handleChangeName = async () => {
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
        <div className="flex items-center justify-end mb-1">
          <SeasonSelector
            currentSeason={currentSeason}
            onSeasonChange={setCurrentSeason}
          />
        </div>

        <div className="flex justify-end">
          <UserInfoBar onEditUsername={openNameModal} />
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
                  onClick={() => setShowNameModal(false)}
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
