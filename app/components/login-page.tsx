"use client";

import { useState } from "react";
import { User, Lock, MessageCircle } from "lucide-react";

// Flappy Bird 스타일 새 컴포넌트 (배경 없음)
function FlappyBird({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* 몸통 (노란색/주황색) */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#F9D71C" />
      <ellipse cx="50" cy="60" rx="30" ry="22" fill="#F5AB35" />

      {/* 배 (연한 크림색) */}
      <ellipse cx="55" cy="62" rx="18" ry="16" fill="#FFF8DC" />

      {/* 눈 (흰색 배경) */}
      <circle cx="62" cy="42" r="14" fill="white" />
      <circle cx="62" cy="42" r="12" stroke="#333" strokeWidth="2" fill="white" />

      {/* 눈동자 */}
      <circle cx="65" cy="42" r="6" fill="#333" />
      <circle cx="67" cy="40" r="2" fill="white" />

      {/* 부리 (주황/빨강) */}
      <path
        d="M 75 52 L 95 55 L 75 62 Z"
        fill="#E84A3C"
      />
      <path
        d="M 75 52 L 95 55 L 75 56 Z"
        fill="#F39C12"
      />

      {/* 날개 */}
      <ellipse cx="30" cy="55" rx="15" ry="10" fill="#E8B923" />
      <ellipse cx="28" cy="55" rx="10" ry="6" fill="#D4A017" />

      {/* 꼬리 */}
      <path
        d="M 15 50 Q 5 45 10 55 Q 5 65 15 60 Z"
        fill="#E8B923"
      />
    </svg>
  );
}

// 구름 컴포넌트
function Cloud({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute bg-white rounded-full opacity-90 ${className}`}
      style={{
        width: "120px",
        height: "40px",
        borderRadius: "20px",
      }}
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
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

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현
    if (process.env.NODE_ENV === "development") {
      console.log("Kakao login initiated");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 하늘 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #4EC0CA 0%, #71C5CF 50%, #87CEEB 100%)",
        }}
      />

      {/* 구름들 */}
      <Cloud className="top-12 left-8" />
      <Cloud className="top-32 left-1/3" />
      <Cloud className="top-16 right-12" />
      <Cloud className="top-48 right-1/4" />

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

      {/* 잔디 배경 */}
      <div className="absolute bottom-0 left-0 right-0 h-24" aria-hidden="true">
        {/* 진한 초록색 잔디 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: "linear-gradient(180deg, #5B8C3E 0%, #4A7A2E 100%)",
          }}
        />
        {/* 연한 초록색 잔디 상단 */}
        <div
          className="absolute bottom-16 left-0 right-0 h-8"
          style={{
            background: "#7CB342",
          }}
        />
      </div>
    </div>
  );
}
