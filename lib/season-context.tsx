"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Season } from "@/components/ui";
import { useUser } from "./user-context";
import { updateSeason } from "./user-service";

interface SeasonContextType {
  currentSeason: Season;
  setCurrentSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | null>(null);

const STORAGE_KEY = "flappy_season";
const DEFAULT_SEASON: Season = "summer";

export function SeasonProvider({ children }: { children: ReactNode }) {
  const { user, patchUser } = useUser();
  const [currentSeason, setSeasonState] = useState<Season>(DEFAULT_SEASON);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기값 로드: DB 유저 데이터 우선, fallback으로 localStorage
  useEffect(() => {
    if (user?.season && ["spring", "summer", "autumn", "winter"].includes(user.season)) {
      setSeasonState(user.season as Season);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY) as Season | null;
      if (saved && ["spring", "summer", "autumn", "winter"].includes(saved)) {
        setSeasonState(saved);
      }
    }
    setIsLoaded(true);
  }, [user]);

  // 변경 시 localStorage + DB 저장
  const setCurrentSeason = (season: Season) => {
    setSeasonState(season);
    localStorage.setItem(STORAGE_KEY, season);

    // DB에도 저장 (로그인 유저가 있을 때)
    if (user?.id) {
      patchUser({ season });
      updateSeason(user.id, season);
    }
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
