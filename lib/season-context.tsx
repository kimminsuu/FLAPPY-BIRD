"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Season } from "@/components/ui";

interface SeasonContextType {
  currentSeason: Season;
  setCurrentSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | null>(null);

const STORAGE_KEY = "flappy_season";
const DEFAULT_SEASON: Season = "summer";

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [currentSeason, setSeasonState] = useState<Season>(DEFAULT_SEASON);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage에서 초기값 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Season | null;
    if (saved && ["spring", "summer", "autumn", "winter"].includes(saved)) {
      setSeasonState(saved);
    }
    setIsLoaded(true);
  }, []);

  // 변경 시 localStorage에 저장
  const setCurrentSeason = (season: Season) => {
    setSeasonState(season);
    localStorage.setItem(STORAGE_KEY, season);
  };

  if (!isLoaded) return null;

  return (
    <SeasonContext.Provider value={{ currentSeason, setCurrentSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason(): SeasonContextType {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
}
