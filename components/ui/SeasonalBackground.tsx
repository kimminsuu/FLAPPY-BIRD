import { ReactNode } from "react";

export type Season = "spring" | "summer" | "autumn" | "winter";

// 계절별 테마 설정
const seasonThemes: Record<
  Season,
  {
    sky: string;
    grass: string;
    grassTop: string;
    cloudColor: string;
    label: string;
  }
> = {
  spring: {
    sky: "linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #98D8C8 100%)",
    grass: "linear-gradient(180deg, #7CB342 0%, #558B2F 100%)",
    grassTop: "#8BC34A",
    cloudColor: "rgba(255, 255, 255, 0.9)",
    label: "봄",
  },
  summer: {
    sky: "linear-gradient(180deg, #4EC0CA 0%, #71C5CF 50%, #87CEEB 100%)",
    grass: "linear-gradient(180deg, #5B8C3E 0%, #4A7A2E 100%)",
    grassTop: "#7CB342",
    cloudColor: "rgba(255, 255, 255, 0.9)",
    label: "여름",
  },
  autumn: {
    sky: "linear-gradient(180deg, #F4A460 0%, #DEB887 50%, #D2B48C 100%)",
    grass: "linear-gradient(180deg, #CD853F 0%, #8B4513 100%)",
    grassTop: "#D2691E",
    cloudColor: "rgba(255, 248, 240, 0.85)",
    label: "가을",
  },
  winter: {
    sky: "linear-gradient(180deg, #B0C4DE 0%, #87CEEB 50%, #E0FFFF 100%)",
    grass: "linear-gradient(180deg, #F0F8FF 0%, #E8E8E8 100%)",
    grassTop: "#FFFAFA",
    cloudColor: "rgba(255, 255, 255, 0.95)",
    label: "겨울",
  },
};

// 구름 컴포넌트
function Cloud({
  className = "",
  color = "rgba(255, 255, 255, 0.9)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`absolute rounded-full ${className}`}
      style={{
        width: "120px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: color,
      }}
      aria-hidden="true"
    />
  );
}

// 눈송이 컴포넌트 (겨울용)
function Snowflake({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute text-white text-opacity-80 ${className}`}
      style={{ fontSize: "20px" }}
      aria-hidden="true"
    >
      *
    </div>
  );
}

// 벚꽃잎 컴포넌트 (봄용)
function CherryBlossom({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: "12px",
        height: "12px",
        backgroundColor: "#FFB7C5",
        borderRadius: "50% 0 50% 50%",
        transform: "rotate(45deg)",
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
}

// 낙엽 컴포넌트 (가을용)
function Leaf({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: "15px",
        height: "15px",
        backgroundColor: "#D2691E",
        borderRadius: "0 50% 50% 50%",
        transform: "rotate(45deg)",
        opacity: 0.6,
      }}
      aria-hidden="true"
    />
  );
}

interface SeasonalBackgroundProps {
  season: Season;
  children: ReactNode;
}

export default function SeasonalBackground({
  season,
  children,
}: SeasonalBackgroundProps) {
  const theme = seasonThemes[season];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 하늘 배경 */}
      <div
        className="absolute inset-0"
        style={{ background: theme.sky }}
      />

      {/* 구름들 */}
      <Cloud className="top-12 left-8" color={theme.cloudColor} />
      <Cloud className="top-32 left-1/3" color={theme.cloudColor} />
      <Cloud className="top-16 right-12" color={theme.cloudColor} />
      <Cloud className="top-48 right-1/4" color={theme.cloudColor} />

      {/* 계절별 장식 요소 */}
      {season === "spring" && (
        <>
          <CherryBlossom className="top-20 left-1/4" />
          <CherryBlossom className="top-40 right-1/3" />
          <CherryBlossom className="top-60 left-1/2" />
          <CherryBlossom className="top-24 right-1/5" />
          <CherryBlossom className="top-52 left-1/6" />
        </>
      )}

      {season === "autumn" && (
        <>
          <Leaf className="top-24 left-1/5" />
          <Leaf className="top-44 right-1/4" />
          <Leaf className="top-36 left-2/3" />
          <Leaf className="top-56 right-1/3" />
        </>
      )}

      {season === "winter" && (
        <>
          <Snowflake className="top-20 left-1/4" />
          <Snowflake className="top-32 right-1/3" />
          <Snowflake className="top-44 left-1/2" />
          <Snowflake className="top-28 right-1/5" />
          <Snowflake className="top-52 left-1/6" />
          <Snowflake className="top-16 right-2/3" />
        </>
      )}

      {/* 메인 컨텐츠 */}
      {children}

      {/* 잔디 배경 */}
      <div className="absolute bottom-0 left-0 right-0 h-24" aria-hidden="true">
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: theme.grass }}
        />
        <div
          className="absolute bottom-16 left-0 right-0 h-8"
          style={{ background: theme.grassTop }}
        />
      </div>
    </div>
  );
}

// 테마 정보 export (다른 곳에서 사용 가능)
export { seasonThemes };
