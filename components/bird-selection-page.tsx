"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Image from "next/image";
import { FlappyBird, SeasonalBackground, UserInfoBar } from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { BIRDS, getBirdsByRarity } from "@/lib/birds";
import { Bird, BirdRarity, BIRD_RARITIES, BIRD_RARITY_INFO } from "@/types/bird";

// 임시: 유저가 보유한 새 ID (나중에 DB에서 가져옴)
// TODO: DB 연동 시 user_birds 테이블에서 조회
const TEMP_OWNED_BIRD_IDS = [
  "bird_common_1",  // 플래피 (COMMON)
  "bird_rare_1",    // 루비새 (RARE)
  "bird_epic_1",    // 강아지 (EPIC)
  "bird_unique_1",  // 우주선 (UNIQUE)
];
// 임시: 현재 장착된 새 ID
const TEMP_EQUIPPED_BIRD_ID = "bird_common_1";

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
        className="px-4 py-2 mb-3 rounded-xl mx-2"
        style={{ backgroundColor: rarityInfo.bgColor }}
      >
        <h3
          className="text-lg font-bold text-center"
          style={{ color: rarityInfo.color }}
        >
          {rarityInfo.labelKo} ({birds.length})
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
  const [ownedBirdIds] = useState<string[]>(TEMP_OWNED_BIRD_IDS);
  const [equippedBirdId, setEquippedBirdId] = useState(TEMP_EQUIPPED_BIRD_ID);
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);

  // localStorage에서 장착된 새 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("flappy_equipped_bird");
    if (saved && ownedBirdIds.includes(saved)) {
      setEquippedBirdId(saved);
    }
  }, [ownedBirdIds]);

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
      localStorage.setItem("flappy_equipped_bird", selectedBirdId);
    }
  };

  const handleBack = () => {
    router.push("/home");
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
          <UserInfoBar />
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
        className="flex-1 overflow-hidden px-2 py-4 pb-40"
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

      {/* 하단 고정 영역 */}
      <div className="absolute bottom-24 left-0 right-0 z-30 px-4 space-y-3">
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
    </SeasonalBackground>
  );
}
