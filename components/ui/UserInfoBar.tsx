"use client";

import { useState, useEffect } from "react";
import { User, Coins } from "lucide-react";

// 기본 코인 (신규 유저는 0원)
const DEFAULT_COINS = 0;
const STORAGE_KEY_COINS = "flappy_user_coins";
const STORAGE_KEY_AUTH = "flappy_auth_user";

interface UserInfoBarProps {
  className?: string;
}

export default function UserInfoBar({ className = "" }: UserInfoBarProps) {
  const [username, setUsername] = useState<string>("");
  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    // 사용자 이름 불러오기
    const authData = localStorage.getItem(STORAGE_KEY_AUTH);
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setUsername(parsed.username || "Guest");
      } catch {
        setUsername("Guest");
      }
    }

    // 코인 불러오기 (없으면 기본값 설정)
    const savedCoins = localStorage.getItem(STORAGE_KEY_COINS);
    if (savedCoins) {
      setCoins(parseInt(savedCoins, 10));
    } else {
      localStorage.setItem(STORAGE_KEY_COINS, DEFAULT_COINS.toString());
      setCoins(DEFAULT_COINS);
    }
  }, []);

  if (!username) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 사용자 이름 */}
      <div className="flex items-center gap-2 bg-gray-700 rounded-full px-4 py-2 shadow-lg">
        <User className="w-4 h-4 text-gray-200" />
        <span className="text-white font-bold text-sm">{username}</span>
      </div>

      {/* 코인 */}
      <div className="flex items-center gap-2 bg-yellow-400 rounded-full px-4 py-2 shadow-lg">
        <Coins className="w-4 h-4 text-yellow-800" />
        <span className="text-yellow-900 font-bold text-sm">
          {coins.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// 코인 관련 유틸리티 함수들 (다른 컴포넌트에서 사용)
export function getUserCoins(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(STORAGE_KEY_COINS);
  return saved ? parseInt(saved, 10) : DEFAULT_COINS;
}

export function setUserCoins(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_COINS, amount.toString());
}

export function addUserCoins(amount: number): number {
  const current = getUserCoins();
  const newAmount = current + amount;
  setUserCoins(newAmount);
  return newAmount;
}

export function subtractUserCoins(amount: number): { success: boolean; newAmount: number } {
  const current = getUserCoins();
  if (current < amount) {
    return { success: false, newAmount: current };
  }
  const newAmount = current - amount;
  setUserCoins(newAmount);
  return { success: true, newAmount };
}
