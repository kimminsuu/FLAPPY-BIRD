/**
 * 닉네임 설정 페이지 (첫 실행 시)
 * - 닉네임 입력 (2~12자, 중복 검사)
 * - 기기 UUID 생성 + Supabase 유저 생성
 * - 계절 테마 선택
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
} from "@/components/ui";
import { useSeason } from "@/lib/season-context";
import { getOrCreateDeviceId } from "@/lib/device";
import { playClickSound } from "@/lib/sound";
import { isUsernameAvailable, createUser } from "@/lib/user-service";
import { useUser } from "@/lib/user-context";

export default function LoginPage() {
  const router = useRouter();
  const { currentSeason, setCurrentSeason } = useSeason();
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    playClickSound();
    setError("");

    const trimmed = username.trim();

    if (!trimmed) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length < 2) {
      setError("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    if (trimmed.length > 12) {
      setError("닉네임은 12자 이하여야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      // 닉네임 중복 확인 (Supabase DB)
      const available = await isUsernameAvailable(trimmed);
      if (!available) {
        setError("이미 사용 중인 닉네임입니다.");
        setIsLoading(false);
        return;
      }

      // 기기 ID 생성 + Supabase에 유저 생성
      const deviceId = getOrCreateDeviceId();
      const newUser = await createUser(deviceId, trimmed);

      if (!newUser) {
        setError("유저 생성에 실패했습니다. 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }

      setUser(newUser);
      router.push("/home");
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 상단 헤더: 계절 선택 버튼 */}
      <div className="relative z-20 px-3 pt-2 pb-1">
        <div className="flex justify-end">
          <SeasonSelector
            currentSeason={currentSeason}
            onSeasonChange={setCurrentSeason}
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-1">
          <FlappyBird className="w-12 h-12 drop-shadow-lg" />
        </div>

        <h1
          className="text-xl font-bold text-white mb-0.5 tracking-wider"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          FLAPPY BIRD
        </h1>
        <p
          className="text-white mb-3 text-sm"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          하늘을 날아라!
        </p>

        {/* 닉네임 설정 카드 */}
        <div className="w-full max-w-[260px] bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#4CAF50] py-1.5">
            <h2 className="text-white text-sm font-bold text-center">
              닉네임 설정
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-2">
            {error && (
              <div
                className="p-1.5 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="relative">
              <label htmlFor="username" className="sr-only">닉네임</label>
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                aria-hidden="true"
              />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="닉네임을 입력하세요"
                autoComplete="off"
                required
                minLength={2}
                maxLength={12}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              2~12자, 게임 내에서 표시됩니다
            </p>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-bold rounded-lg transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "확인 중..." : "시작하기"}
            </button>
          </form>
        </div>
      </div>
    </SeasonalBackground>
  );
}
