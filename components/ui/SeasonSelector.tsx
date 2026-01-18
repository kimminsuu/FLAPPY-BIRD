"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { Season, seasonThemes } from "./SeasonalBackground";

interface SeasonSelectorProps {
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const seasons: Season[] = ["spring", "summer", "autumn", "winter"];

// 계절별 아이콘/이모지
const seasonIcons: Record<Season, string> = {
  spring: "🌸",
  summer: "☀️",
  autumn: "🍂",
  winter: "❄️",
};

export default function SeasonSelector({
  currentSeason,
  onSeasonChange,
}: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (season: Season) => {
    onSeasonChange(season);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* 배경 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
        aria-label="배경 선택"
      >
        <Palette className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {seasonIcons[currentSeason]} {seasonThemes[currentSeason].label}
        </span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 선택 패널 */}
          <div className="absolute top-12 right-0 z-50 bg-white rounded-xl shadow-xl overflow-hidden min-w-[180px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <span className="text-sm font-bold text-gray-700">배경 선택</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 계절 옵션들 */}
            <div className="p-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => handleSelect(season)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentSeason === season
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="text-xl">{seasonIcons[season]}</span>
                  <span className="font-medium">
                    {seasonThemes[season].label}
                  </span>
                  {currentSeason === season && (
                    <span className="ml-auto text-green-600 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
