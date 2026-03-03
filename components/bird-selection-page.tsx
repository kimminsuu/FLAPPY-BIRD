/**
 * 새 선택 + 가챠(뽑기) 페이지
 * - 등급별(COMMON/RARE/EPIC/UNIQUE) 3행 격자 레이아웃
 * - 터치 스와이프 좌우 스크롤
 * - 가챠 뽑기 (100코인, 중복 시 50코인 환급)
 * - 새 장착/해제
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Coins, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { FlappyBird, SeasonalBackground, UserInfoBar } from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { useUser } from "@/lib/user-context";
import {
  getOwnedBirdIds,
  getCoins,
  subtractCoins,
  addCoins,
  equipBird,
  addBird,
} from "@/lib/user-service";
import { BIRDS, getBirdsByRarity, performGacha, getGachaCost, canPerformGacha } from "@/lib/birds";
import { playClickSound, playEquipSound, playGachaResultSound } from "@/lib/sound";
import { Bird, BirdRarity, BIRD_RARITIES, BIRD_RARITY_INFO, GACHA_CONFIG, GachaResult } from "@/types/bird";

type GachaPhase = "idle" | "animating" | "result";

interface BirdCardProps {
  bird: Bird;
  isOwned: boolean;
  isEquipped: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function BirdCard({ bird, isOwned, isEquipped, isSelected, onClick }: BirdCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isOwned}
      className={`
        relative flex-shrink-0 w-14 h-16 rounded-lg transition-all duration-200
        ${isOwned ? "bg-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95" : "bg-gray-200/70"}
        ${isSelected ? "ring-2 ring-[#4CAF50] ring-offset-1" : ""}
      `}
    >
      {/* 새 이미지 */}
      <div className="flex items-center justify-center h-9 pt-0.5">
        {!isOwned ? (
          <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        ) : bird.imagePath === "svg" ? (
          <FlappyBird className="w-8 h-8" />
        ) : (
          <Image
            src={bird.imagePath}
            alt={bird.nameKo}
            width={32}
            height={22}
            className="object-contain"
          />
        )}
      </div>

      {/* 새 이름 */}
      <div className="px-0.5 pb-0.5">
        <p className={`text-[8px] font-bold text-center truncate ${isOwned ? "text-gray-800" : "text-gray-400"}`}>
          {bird.nameKo}
        </p>
      </div>

      {/* 장착됨 뱃지 */}
      {isEquipped && isOwned && (
        <div className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Check className="w-2.5 h-2.5" />
          장착
        </div>
      )}

      {/* 미보유 오버레이 */}
      {!isOwned && (
        <div className="absolute inset-0 rounded-lg bg-black/20" />
      )}
    </button>
  );
}

interface RaritySectionProps {
  rarity: BirdRarity;
  birds: readonly Bird[];
  ownedBirdIds: string[];
  equippedBirdId: string;
  selectedBirdId: string | null;
  onBirdSelect: (birdId: string) => void;
}

function RaritySection({
  rarity,
  birds,
  ownedBirdIds,
  equippedBirdId,
  selectedBirdId,
  onBirdSelect,
}: RaritySectionProps) {
  const rarityInfo = BIRD_RARITY_INFO[rarity];

  // 3행으로 나누기
  const rows: Bird[][] = [[], [], []];
  birds.forEach((bird, index) => {
    rows[index % 3].push(bird);
  });

  return (
    <div className="flex-shrink-0">
      {/* 등급 헤더 */}
      <div
        className="mb-1 mx-0.5 rounded-md py-1 px-2 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color}DD)`,
        }}
      >
        <h3
          className="text-[10px] font-black text-center tracking-widest"
          style={{
            color: "#FFFFFF",
            textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.3)",
            WebkitTextStroke: "0.5px rgba(0,0,0,0.2)",
          }}
        >
          {rarityInfo.label}
        </h3>
      </div>

      {/* 3행 격자 */}
      <div className="flex flex-col gap-1 px-0.5">
        {rows.map((rowBirds, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {rowBirds.map((bird) => (
              <BirdCard
                key={bird.id}
                bird={bird}
                isOwned={ownedBirdIds.includes(bird.id)}
                isEquipped={equippedBirdId === bird.id}
                isSelected={selectedBirdId === bird.id}
                onClick={() => onBirdSelect(bird.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BirdSelectionPage() {
  const router = useRouter();
  const { currentSeason } = useSeason();

  const { user, refreshUser, patchUser } = useUser();

  // 상태
  const [ownedBirdIds, setOwnedBirdIds] = useState<string[]>(["bird_common_1"]);
  const [equippedBirdId, setEquippedBirdId] = useState("bird_common_1");
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [coinRefreshKey, setCoinRefreshKey] = useState(0);

  // 가챠 상태
  const [gachaPhase, setGachaPhase] = useState<GachaPhase>("idle");
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null);

  // Supabase에서 초기 데이터 로드
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getOwnedBirdIds(user.id),
      getCoins(user.id),
    ]).then(([owned, coins]) => {
      setOwnedBirdIds(owned.length > 0 ? owned : ["bird_common_1"]);
      setEquippedBirdId(user.equipped_bird_id);
      setUserCoins(coins);
    });
  }, [user]);

  // 등급별 새 목록
  const birdsByRarity = BIRD_RARITIES.map((rarity) => ({
    rarity,
    birds: getBirdsByRarity(rarity),
  }));

  const handleBirdSelect = (birdId: string) => {
    if (ownedBirdIds.includes(birdId)) {
      playClickSound();
      setSelectedBirdId(birdId);
    }
  };

  const handleEquip = () => {
    playEquipSound();
    if (selectedBirdId && ownedBirdIds.includes(selectedBirdId) && user) {
      setEquippedBirdId(selectedBirdId);
      setSelectedBirdId(null);
      equipBird(user.id, selectedBirdId);
      patchUser({ equipped_bird_id: selectedBirdId });
    }
  };

  const handleBack = () => {
    playClickSound();
    router.push("/home");
  };

  // 가챠 실행
  const handleGacha = async () => {
    if (!user || !canPerformGacha(userCoins)) return;
    playClickSound();

    const { success, newAmount } = await subtractCoins(user.id, getGachaCost());
    if (!success) return;

    setUserCoins(newAmount);
    patchUser({ coins: newAmount });

    const result = performGacha(ownedBirdIds);
    setGachaResult(result);
    setGachaPhase("animating");

    setTimeout(async () => {
      setGachaPhase("result");
      playGachaResultSound(result.bird.rarity);

      if (result.isNew) {
        const newOwnedBirds = [...ownedBirdIds, result.bird.id];
        setOwnedBirdIds(newOwnedBirds);
        await addBird(user.id, result.bird.id);
      } else {
        const refundedAmount = await addCoins(user.id, result.refundCoins);
        setUserCoins(refundedAmount);
        patchUser({ coins: refundedAmount });
      }
    }, 1500);
  };

  const handleCloseGacha = () => {
    playClickSound();
    setGachaPhase("idle");
    setGachaResult(null);
  };

  const handleGachaAgain = () => {
    playClickSound();
    setGachaPhase("idle");
    setGachaResult(null);
    setTimeout(() => {
      handleGacha();
    }, 100);
  };

  const selectedBird = selectedBirdId
    ? BIRDS.find((b) => b.id === selectedBirdId)
    : null;

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 헤더 */}
      <div className="relative z-20 flex items-center justify-between px-3 pt-1 pb-0.5">
        <button
          onClick={handleBack}
          className="p-1 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1
          className="text-base font-bold text-white"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          새 선택
        </h1>
        <UserInfoBar key={coinRefreshKey} />
      </div>

      {/* 보유 현황 */}
      <div className="relative z-20 px-3 py-0.5">
        <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-0.5 border border-white/30">
          <p className="text-white text-center text-[10px]">
            보유: <span className="font-bold">{ownedBirdIds.length}</span> / {BIRDS.length}
          </p>
        </div>
      </div>

      {/* 새 목록 (터치 스와이프 스크롤) */}
      <div
        className="relative z-10 flex-1 overflow-x-auto overflow-y-hidden px-2 py-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 h-full items-start">
          {birdsByRarity.map(({ rarity, birds }) => (
            <RaritySection
              key={rarity}
              rarity={rarity}
              birds={birds}
              ownedBirdIds={ownedBirdIds}
              equippedBirdId={equippedBirdId}
              selectedBirdId={selectedBirdId}
              onBirdSelect={handleBirdSelect}
            />
          ))}
        </div>
      </div>

      {/* 하단 고정 영역 (잔디 위) */}
      <div className="relative z-30 px-3 pb-8 space-y-1">
        {/* 가챠 버튼 */}
        <button
          onClick={handleGacha}
          disabled={!canPerformGacha(userCoins)}
          className={`w-full py-1.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
            canPerformGacha(userCoins)
              ? "bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 active:scale-95 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {canPerformGacha(userCoins) ? (
            <>
              뽑기 1회
              <span className="flex items-center gap-1 bg-white/30 px-2 py-0.5 rounded-full text-xs">
                <Coins className="w-3 h-3" />
                {GACHA_CONFIG.cost}
              </span>
            </>
          ) : (
            <>코인 부족 (필요: {GACHA_CONFIG.cost})</>
          )}
        </button>

        {/* 액션 바 (선택 시) */}
        {selectedBird && (
          <div className="bg-white rounded-xl shadow-xl p-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
                {selectedBird.imagePath === "svg" ? (
                  <FlappyBird className="w-6 h-6" />
                ) : (
                  <Image
                    src={selectedBird.imagePath}
                    alt={selectedBird.nameKo}
                    width={24}
                    height={17}
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-xs truncate">
                  {selectedBird.nameKo}
                </p>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: BIRD_RARITY_INFO[selectedBird.rarity].color }}
                >
                  {BIRD_RARITY_INFO[selectedBird.rarity].labelKo}
                </p>
              </div>
              <button
                onClick={handleEquip}
                disabled={equippedBirdId === selectedBirdId}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  equippedBirdId === selectedBirdId
                    ? "bg-gray-200 text-gray-400"
                    : "bg-[#4CAF50] hover:bg-[#43A047] active:bg-[#388E3C] text-white"
                }`}
              >
                {equippedBirdId === selectedBirdId ? "장착중" : "장착"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 가챠 모달 */}
      {gachaPhase !== "idle" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative z-10 w-64">
            {gachaPhase === "animating" && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-36 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-xl shadow-2xl animate-pulse flex items-center justify-center">
                    <div className="absolute inset-0 rounded-xl animate-spin-slow bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                    <Sparkles className="w-12 h-12 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-300 rounded-full animate-ping opacity-75" />
                  <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-pink-300 rounded-full animate-ping opacity-75 delay-300" />
                </div>
                <p className="mt-4 text-white text-base font-bold animate-pulse">
                  뽑는 중...
                </p>
              </div>
            )}

            {gachaPhase === "result" && gachaResult && (
              <div className="flex flex-col items-center">
                <button
                  onClick={handleCloseGacha}
                  className="absolute -top-1 -right-1 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div
                  className="relative w-36 h-44 rounded-xl shadow-2xl overflow-hidden transform animate-flip-in"
                  style={{
                    backgroundColor: BIRD_RARITY_INFO[gachaResult.bird.rarity].bgColor,
                    borderWidth: "3px",
                    borderColor: BIRD_RARITY_INFO[gachaResult.bird.rarity].color,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${BIRD_RARITY_INFO[gachaResult.bird.rarity].color}40, transparent 70%)`,
                    }}
                  />

                  <div className="absolute top-2 left-2 z-10">
                    {gachaResult.isNew ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-xs shadow-lg animate-bounce">
                        NEW!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-full text-xs shadow-lg flex items-center gap-0.5">
                        중복 +{gachaResult.refundCoins}
                        <Coins className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center h-24 pt-5">
                    {gachaResult.bird.imagePath === "svg" ? (
                      <FlappyBird className="w-16 h-16 drop-shadow-lg" />
                    ) : (
                      <Image
                        src={gachaResult.bird.imagePath}
                        alt={gachaResult.bird.nameKo}
                        width={64}
                        height={44}
                        className="object-contain drop-shadow-lg"
                      />
                    )}
                  </div>

                  <div className="px-2 pb-2 text-center">
                    <p
                      className="text-base font-bold"
                      style={{ color: BIRD_RARITY_INFO[gachaResult.bird.rarity].color }}
                    >
                      {gachaResult.bird.nameKo}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: BIRD_RARITY_INFO[gachaResult.bird.rarity].color }}
                    >
                      {BIRD_RARITY_INFO[gachaResult.bird.rarity].labelKo}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={handleCloseGacha}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    확인
                  </button>
                  {canPerformGacha(userCoins) && (
                    <button
                      onClick={handleGachaAgain}
                      className="flex-1 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      한 번 더!
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SeasonalBackground>
  );
}
