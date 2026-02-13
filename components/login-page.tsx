"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import {
  FlappyBird,
  SeasonalBackground,
  SeasonSelector,
} from "@/components/ui";
import { useSeason } from "@/lib/season-context";

// 마스터 계정 (TODO: 추후 DB 연동으로 대체)
const MASTER_ACCOUNT = {
  username: "admin",
  password: "admin1!",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { currentSeason, setCurrentSeason } = useSeason();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      // TODO: 추후 실제 로그인 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (
        username.trim() === MASTER_ACCOUNT.username &&
        password === MASTER_ACCOUNT.password
      ) {
        // 로그인 성공: 인증 정보 저장 후 홈으로 이동
        localStorage.setItem(
          "flappy_auth_user",
          JSON.stringify({ username: username.trim() })
        );
        // admin 계정: 코인이 없을 때만 테스트용 500 코인 지급
        if (!localStorage.getItem("flappy_user_coins")) {
          localStorage.setItem("flappy_user_coins", "500");
        }
        // 보유 새 초기화 (없을 때만)
        if (!localStorage.getItem("flappy_owned_birds")) {
          if (username.trim() === "admin") {
            // admin: 테스트용 4종 보유
            localStorage.setItem(
              "flappy_owned_birds",
              JSON.stringify(["bird_common_1", "bird_rare_1", "bird_epic_1", "bird_unique_1"])
            );
          } else {
            // 일반 유저: 기본 새만 보유
            localStorage.setItem(
              "flappy_owned_birds",
              JSON.stringify(["bird_common_1"])
            );
          }
        }
        router.push("/home");
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SeasonalBackground season={currentSeason}>
      {/* 상단 헤더: 계절 선택 버튼 */}
      <div className="relative z-20 px-4 pt-4 pb-2">
        <div className="flex justify-end">
          <SeasonSelector
            currentSeason={currentSeason}
            onSeasonChange={setCurrentSeason}
          />
        </div>
      </div>

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

          </form>
        </div>
      </div>
    </SeasonalBackground>
  );
}
