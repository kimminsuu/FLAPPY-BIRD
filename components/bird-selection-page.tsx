"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Coins, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { FlappyBird, SeasonalBackground, UserInfoBar } from "@/components/ui";
import { getUserCoins, subtractUserCoins, addUserCoins } from "@/components/ui/UserInfoBar";
import { useSeason } from "@/lib/season-context";
import { BIRDS, getBirdsByRarity, performGacha, getGachaCost, canPerformGacha } from "@/lib/birds";
import { Bird, BirdRarity, BIRD_RARITIES, BIRD_RARITY_INFO, GACHA_CONFIG, GachaResult } from "@/types/bird";

const STORAGE_KEY_OWNED_BIRDS = "flappy_owned_birds";
const STORAGE_KEY_EQUIPPED_BIRD = "flappy_equipped_bird";

/** localStorage에서 보유 새 목록 읽기 */
function loadOwnedBirds(): string[] {
  if (typeof window === "undefined") return ["bird_common_1"];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OWNED_BIRDS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* fallback */ }
  return ["bird_common_1"];
}

/** localStorage에 보유 새 목록 저장 */
function saveOwnedBirds(birdIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OWNED_BIRDS, JSON.stringify(birdIds));
  } catch { /* storage unavailable */ }
}

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
        relative flex-shrink-0 w-28 h-36 rounded-2xl transition-all duration-200
        ${isOwned ? "bg-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95" : "bg-gray-200/70"}
        ${isSelected ? "ring-4 ring-[#4CAF50] ring-offset-2" : ""}
      `}
    >
      {/* 새 이미지 */}
      <div className="flex items-center justify-center h-24 pt-2">
        {!isOwned ? (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-300 rounded-full">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
        ) : bird.imagePath === "svg" ? (
          <FlappyBird className="w-16 h-16" />
        ) : (
          <Image
            src={bird.imagePath}
            alt={bird.nameKo}
            width={64}
            height={44}
            className="object-contain"
          />
        )}
      </div>

      {/* 새 이름 */}
      <div className="px-2 pb-2">
        <p className={`text-sm font-bold text-center truncate ${isOwned ? "text-gray-800" : "text-gray-400"}`}>
          {bird.nameKo}
        </p>
      </div>

      {/* 장착됨 뱃지 */}
      {isEquipped && isOwned && (
        <div className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Check className="w-3 h-3" />
          장착
        </div>
      )}

      {/* 미보유 오버레이 */}
      {!isOwned && (
        <div className="absolute inset-0 rounded-2xl bg-black/20" />
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

  // 3행으로 나누기 (왼쪽 위부터 순서대로)
  const rows: Bird[][] = [[], [], []];
  birds.forEach((bird, index) => {
    rows[index % 3].push(bird);
  });

  return (
    <div className="flex-shrink-0">
      {/* 등급 헤더 */}
      <div
        className="mb-3 mx-2 rounded-2xl py-3 px-5 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color}DD)`,
        }}
      >
        <h3
          className="text-2xl font-black text-center tracking-widest"
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
      <div className="flex flex-col gap-3 px-2">
        {rows.map((rowBirds, rowIndex) => (
          <div key={rowIndex} className="flex gap-3">
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  // 상태
  const [ownedBirdIds, setOwnedBirdIds] = useState<string[]>(() => loadOwnedBirds());
  const [equippedBirdId, setEquippedBirdId] = useState("bird_common_1");
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [coinRefreshKey, setCoinRefreshKey] = useState(0);

  // 가챠 상태
  const [gachaPhase, setGachaPhase] = useState<GachaPhase>("idle");
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null);

  // 초기화 (클라이언트에서만 실행)
  useEffect(() => {
    // 보유 새 불러오기
    setOwnedBirdIds(loadOwnedBirds());

    // 장착된 새 불러오기
    const savedEquipped = localStorage.getItem(STORAGE_KEY_EQUIPPED_BIRD);
    const owned = loadOwnedBirds();
    if (savedEquipped && owned.includes(savedEquipped)) {
      setEquippedBirdId(savedEquipped);
    }

    // 코인 불러오기
    setUserCoins(getUserCoins());
  }, []);

  // 스크롤바 상태
  const [thumbPosition, setThumbPosition] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const dragStartX = useRef(0);
  const dragStartThumbPos = useRef(0);

  // 등급별 새 목록
  const birdsByRarity = BIRD_RARITIES.map((rarity) => ({
    rarity,
    birds: getBirdsByRarity(rarity),
  }));

  // 스크롤 컨테이너 크기 계산
  useEffect(() => {
    const updateThumbSize = () => {
      if (!scrollContainerRef.current) return;
      const { clientWidth, scrollWidth } = scrollContainerRef.current;
      const ratio = clientWidth / scrollWidth;
      setThumbWidth(Math.max(ratio * 100, 15)); // 최소 15%
    };

    updateThumbSize();
    window.addEventListener("resize", updateThumbSize);
    return () => window.removeEventListener("resize", updateThumbSize);
  }, []);

  // 스크롤바 드래그 핸들러 (마우스)
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingThumb(true);
    dragStartX.current = e.clientX;
    dragStartThumbPos.current = thumbPosition;
  };

  // 스크롤바 드래그 핸들러 (터치)
  const handleThumbTouchStart = (e: React.TouchEvent) => {
    setIsDraggingThumb(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartThumbPos.current = thumbPosition;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingThumb || !scrollBarRef.current || !scrollContainerRef.current) return;

      const barWidth = scrollBarRef.current.clientWidth;
      const dx = e.clientX - dragStartX.current;
      const dxPercent = (dx / barWidth) * 100;
      const newPos = Math.max(0, Math.min(100 - thumbWidth, dragStartThumbPos.current + dxPercent));

      setThumbPosition(newPos);

      // 실제 스크롤 적용
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      scrollContainerRef.current.scrollLeft = (newPos / (100 - thumbWidth)) * maxScroll;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingThumb || !scrollBarRef.current || !scrollContainerRef.current) return;

      const barWidth = scrollBarRef.current.clientWidth;
      const dx = e.touches[0].clientX - dragStartX.current;
      const dxPercent = (dx / barWidth) * 100;
      const newPos = Math.max(0, Math.min(100 - thumbWidth, dragStartThumbPos.current + dxPercent));

      setThumbPosition(newPos);

      // 실제 스크롤 적용
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      scrollContainerRef.current.scrollLeft = (newPos / (100 - thumbWidth)) * maxScroll;
    };

    const handleMouseUp = () => {
      setIsDraggingThumb(false);
    };

    const handleTouchEnd = () => {
      setIsDraggingThumb(false);
    };

    if (isDraggingThumb) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDraggingThumb, thumbWidth]);

  const handleBirdSelect = (birdId: string) => {
    if (ownedBirdIds.includes(birdId)) {
      setSelectedBirdId(birdId);
    }
  };

  const handleEquip = () => {
    if (selectedBirdId && ownedBirdIds.includes(selectedBirdId)) {
      setEquippedBirdId(selectedBirdId);
      setSelectedBirdId(null);
      // localStorage에 저장 (나중에 DB로 대체)
      localStorage.setItem(STORAGE_KEY_EQUIPPED_BIRD, selectedBirdId);
    }
  };

  const handleBack = () => {
    router.push("/home");
  };

  // 가챠 실행
  const handleGacha = () => {
    const currentCoins = getUserCoins();
    if (!canPerformGacha(currentCoins)) {
      return;
    }

    // 코인 차감
    const { success, newAmount } = subtractUserCoins(getGachaCost());
    if (!success) return;

    setUserCoins(newAmount);
    setCoinRefreshKey((prev) => prev + 1);

    // 뽑기 실행
    const result = performGacha(ownedBirdIds);
    setGachaResult(result);
    setGachaPhase("animating");

    // 애니메이션 후 결과 표시
    setTimeout(() => {
      setGachaPhase("result");

      // 신규 새면 보유 목록에 추가
      if (result.isNew) {
        const newOwnedBirds = [...ownedBirdIds, result.bird.id];
        setOwnedBirdIds(newOwnedBirds);
        saveOwnedBirds(newOwnedBirds);
      } else {
        // 중복이면 환급
        const refundedAmount = addUserCoins(result.refundCoins);
        setUserCoins(refundedAmount);
        setCoinRefreshKey((prev) => prev + 1);
      }
    }, 1500);
  };

  // 가챠 모달 닫기
  const handleCloseGacha = () => {
    setGachaPhase("idle");
    setGachaResult(null);
  };

  // 한 번 더 뽑기
  const handleGachaAgain = () => {
    setGachaPhase("idle");
    setGachaResult(null);
    // 약간의 딜레이 후 다시 뽑기
    setTimeout(() => {
      handleGacha();
    }, 100);
  };

  // 선택된 새 정보
  const selectedBird = selectedBirdId
    ? BIRDS.find((b) => b.id === selectedBirdId)
    : null;

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 헤더 */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={handleBack}
          className="p-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1
          className="text-2xl font-bold text-white"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          새 선택
        </h1>
        <div className="w-10" />
      </div>

      {/* 유저 정보 + 보유 현황 */}
      <div className="relative z-20 px-4 py-2 space-y-2">
        <div className="flex justify-end">
          <UserInfoBar key={coinRefreshKey} />
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
          <p className="text-white text-center text-sm">
            보유: <span className="font-bold">{ownedBirdIds.length}</span> / {BIRDS.length}
          </p>
        </div>
      </div>

      {/* 새 목록 (스크롤 비활성화) */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-hidden px-2 py-4"
        style={{ touchAction: "none" }}
      >
        <div className="flex gap-6 h-full items-start">
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
      <div className="relative z-30 px-4 pb-28 space-y-3">
        {/* 스크롤바 */}
        <div
          ref={scrollBarRef}
          className="relative h-10 bg-white/50 backdrop-blur-sm rounded-full border-2 border-white/60 shadow-lg"
        >
          <div
            ref={scrollThumbRef}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbTouchStart}
            className={`absolute top-1 bottom-1 rounded-full transition-colors ${
              isDraggingThumb ? "bg-[#4CAF50]" : "bg-[#66BB6A] hover:bg-[#4CAF50]"
            } cursor-grab active:cursor-grabbing shadow-lg`}
            style={{
              left: `${thumbPosition}%`,
              width: `${thumbWidth}%`,
              minWidth: "60px",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center gap-1.5">
              <div className="w-1 h-4 bg-white/60 rounded-full" />
              <div className="w-1 h-4 bg-white/60 rounded-full" />
              <div className="w-1 h-4 bg-white/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* 가챠 버튼 */}
        <button
          onClick={handleGacha}
          disabled={!canPerformGacha(userCoins)}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
            canPerformGacha(userCoins)
              ? "bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 active:scale-95 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-6 h-6" />
          {canPerformGacha(userCoins) ? (
            <>
              뽑기 1회
              <span className="flex items-center gap-1 bg-white/30 px-3 py-1 rounded-full text-base">
                <Coins className="w-4 h-4" />
                {GACHA_CONFIG.cost}
              </span>
            </>
          ) : (
            <>코인 부족 (필요: {GACHA_CONFIG.cost})</>
          )}
        </button>

        {/* 액션 바 (선택 시) */}
        {selectedBird && (
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-xl">
                {selectedBird.imagePath === "svg" ? (
                  <FlappyBird className="w-12 h-12" />
                ) : (
                  <Image
                    src={selectedBird.imagePath}
                    alt={selectedBird.nameKo}
                    width={48}
                    height={33}
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">
                  {selectedBird.nameKo}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: BIRD_RARITY_INFO[selectedBird.rarity].color }}
                >
                  {BIRD_RARITY_INFO[selectedBird.rarity].labelKo}
                </p>
              </div>
              <button
                onClick={handleEquip}
                disabled={equippedBirdId === selectedBirdId}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 오버레이 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* 모달 컨텐츠 */}
          <div className="relative z-10 w-80">
            {/* 애니메이션 단계 */}
            {gachaPhase === "animating" && (
              <div className="flex flex-col items-center">
                {/* 카드 뒷면 + 빛나는 효과 */}
                <div className="relative">
                  <div className="w-48 h-64 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl shadow-2xl animate-pulse flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl animate-spin-slow bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                    <Sparkles className="w-16 h-16 text-white animate-bounce" />
                  </div>
                  {/* 빛나는 파티클 */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-75" />
                  <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pink-300 rounded-full animate-ping opacity-75 delay-300" />
                  <div className="absolute top-1/2 -right-6 w-4 h-4 bg-blue-300 rounded-full animate-ping opacity-75 delay-500" />
                </div>
                <p className="mt-6 text-white text-xl font-bold animate-pulse">
                  뽑는 중...
                </p>
              </div>
            )}

            {/* 결과 단계 */}
            {gachaPhase === "result" && gachaResult && (
              <div className="flex flex-col items-center">
                {/* 닫기 버튼 */}
                <button
                  onClick={handleCloseGacha}
                  className="absolute -top-2 -right-2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* 결과 카드 */}
                <div
                  className="relative w-56 h-72 rounded-2xl shadow-2xl overflow-hidden transform animate-flip-in"
                  style={{
                    backgroundColor: BIRD_RARITY_INFO[gachaResult.bird.rarity].bgColor,
                    borderWidth: "4px",
                    borderColor: BIRD_RARITY_INFO[gachaResult.bird.rarity].color,
                  }}
                >
                  {/* 빛 이펙트 */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${BIRD_RARITY_INFO[gachaResult.bird.rarity].color}40, transparent 70%)`,
                    }}
                  />

                  {/* NEW 또는 중복 배지 */}
                  <div className="absolute top-3 left-3 z-10">
                    {gachaResult.isNew ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-sm shadow-lg animate-bounce">
                        NEW!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-full text-sm shadow-lg flex items-center gap-1">
                        중복 +{gachaResult.refundCoins}
                        <Coins className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* 새 이미지 */}
                  <div className="flex items-center justify-center h-44 pt-8">
                    {gachaResult.bird.imagePath === "svg" ? (
                      <FlappyBird className="w-24 h-24 drop-shadow-lg" />
                    ) : (
                      <Image
                        src={gachaResult.bird.imagePath}
                        alt={gachaResult.bird.nameKo}
                        width={96}
                        height={66}
                        className="object-contain drop-shadow-lg"
                      />
                    )}
                  </div>

                  {/* 새 정보 */}
                  <div className="px-4 pb-4 text-center">
                    <p
                      className="text-xl font-bold"
                      style={{ color: BIRD_RARITY_INFO[gachaResult.bird.rarity].color }}
                    >
                      {gachaResult.bird.nameKo}
                    </p>
                    <p
                      className="text-sm font-medium mt-1"
                      style={{ color: BIRD_RARITY_INFO[gachaResult.bird.rarity].color }}
                    >
                      {BIRD_RARITY_INFO[gachaResult.bird.rarity].labelKo}
                    </p>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 mt-6 w-full">
                  <button
                    onClick={handleCloseGacha}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors"
                  >
                    확인
                  </button>
                  {canPerformGacha(userCoins) && (
                    <button
                      onClick={handleGachaAgain}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
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
