/**
 * 유저 정보 표시 바
 * - 닉네임 (User 아이콘) + 코인 잔액 (Coins 아이콘)
 * - 선택적 닉네임 편집 버튼
 */

"use client";

import { User, Coins, Pencil } from "lucide-react";
import { useUser } from "@/lib/user-context";

interface UserInfoBarProps {
  className?: string;
  onEditUsername?: () => void;
}

export default function UserInfoBar({
  className = "",
  onEditUsername,
}: UserInfoBarProps) {
  const { user } = useUser();

  const username = user?.username ?? "";
  const coins = user?.coins ?? 0;

  if (!username) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 사용자 이름 */}
      {onEditUsername ? (
        <button
          onClick={onEditUsername}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full px-4 py-2 shadow-lg transition-colors"
        >
          <User className="w-4 h-4 text-gray-200" />
          <span className="text-white font-bold text-sm">{username}</span>
          <Pencil className="w-3 h-3 text-gray-300" />
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-gray-700 rounded-full px-4 py-2 shadow-lg">
          <User className="w-4 h-4 text-gray-200" />
          <span className="text-white font-bold text-sm">{username}</span>
        </div>
      )}

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
