"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { User, Lock, MessageCircle } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
  Season,
} from "@/components/ui";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSeason, setCurrentSeason] = useState<Season>("summer");

  // 이미 로그인된 경우 표시
  if (status === "authenticated" && session) {
    return (
      <SeasonalBackground season={currentSeason}>
        <SeasonSelector
          currentSeason={currentSeason}
          onSeasonChange={setCurrentSeason}
        />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <FlappyBird className="w-24 h-24 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">환영합니다!</h1>
          <p className="text-white mb-4">{session.user?.name || "플레이어"}님</p>
          <p className="text-white/80 text-sm">곧 게임 화면으로 이동합니다...</p>
        </div>
      </SeasonalBackground>
    );
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 입력 검증
    if (!username.trim()) {
      setError("사용자 이름을 입력해주세요.");
      return;
    }
    if (!password || password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 실제 로그인 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이

      // 로그인 성공 시 처리
      if (process.env.NODE_ENV === "development") {
        console.log("Login attempt for user:", username);
      }
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("kakao", {
        callbackUrl: "/", // 로그인 성공 후 이동할 페이지
      });
    } catch {
      setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 배경 선택 버튼 */}
      <SeasonSelector
        currentSeason={currentSeason}
        onSeasonChange={setCurrentSeason}
      />

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-32">
        {/* 새 아이콘 (Flappy Bird 스타일) */}
        <div className="mb-4">
          <FlappyBird className="w-24 h-24 drop-shadow-lg" />
        </div>

        {/* 타이틀 */}
        <h1
          className="text-4xl font-bold text-white mb-1 tracking-wider"
          style={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          FLAPPY BIRD
        </h1>
        <p
          className="text-white mb-8 text-lg"
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          하늘을 날아라!
        </p>

        {/* 로그인 카드 */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 카드 헤더 */}
          <div className="bg-[#4CAF50] py-4">
            <h2 className="text-white text-xl font-bold text-center">로그인</h2>
          </div>

          {/* 카드 바디 */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div
                className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* 사용자 이름 입력 */}
            <div className="relative">
              <label htmlFor="username" className="sr-only">
                사용자 이름
              </label>
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
              />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="사용자 이름"
                autoComplete="username"
                required
                minLength={2}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
              />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호"
                autoComplete="current-password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* 시작하기 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-lg transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "시작하기"}
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" aria-hidden="true" />
              <span className="text-gray-400 text-sm">또는</span>
              <div className="flex-1 h-px bg-gray-300" aria-hidden="true" />
            </div>

            {/* 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD800] text-[#3C1E1E] font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              카카오로 시작하기
            </button>
          </form>
        </div>
      </div>
    </SeasonalBackground>
  );
}
