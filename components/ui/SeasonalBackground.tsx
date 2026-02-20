import { ReactNode, useMemo } from "react";

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

// ==================== 계절별 애니메이션 파티클 ====================

interface ParticleConfig {
  count: number;
  sizeRange: [number, number];
  durationRange: [number, number];
  delayRange: [number, number];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// 봄: 벚꽃잎 날리기
function SpringParticles() {
  const particles = useMemo(() => {
    const items = [];
    const cfg: ParticleConfig = {
      count: 15,
      sizeRange: [10, 18],
      durationRange: [6, 12],
      delayRange: [0, 8],
    };
    for (let i = 0; i < cfg.count; i++) {
      const size =
        cfg.sizeRange[0] + seededRandom(i) * (cfg.sizeRange[1] - cfg.sizeRange[0]);
      const left = seededRandom(i + 100) * 100;
      const duration =
        cfg.durationRange[0] +
        seededRandom(i + 200) * (cfg.durationRange[1] - cfg.durationRange[0]);
      const delay =
        cfg.delayRange[0] +
        seededRandom(i + 300) * (cfg.delayRange[1] - cfg.delayRange[0]);
      const color = seededRandom(i + 400) > 0.5 ? "#FFB7C5" : "#FFC0CB";
      const swayAmount = 30 + seededRandom(i + 500) * 60;
      items.push({ size, left, duration, delay, color, swayAmount, id: i });
    }
    return items;
  }, []);

  return (
    <>
      <style>{`
        @keyframes cherry-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translateY(105vh) translateX(var(--sway)) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: "50% 0 50% 50%",
            opacity: 0,
            animation: `cherry-fall ${p.duration}s ${p.delay}s ease-in-out infinite`,
            ["--sway" as string]: `${p.swayAmount}px`,
            pointerEvents: "none" as const,
          }}
        />
      ))}
    </>
  );
}

// 여름: 구름 떠다니기
function SummerParticles() {
  const clouds = useMemo(() => {
    const items = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const width = 80 + seededRandom(i) * 100;
      const height = width * 0.35;
      const top = 5 + seededRandom(i + 100) * 40;
      const duration = 20 + seededRandom(i + 200) * 25;
      const delay = seededRandom(i + 300) * 15;
      const opacity = 0.4 + seededRandom(i + 400) * 0.4;
      items.push({ width, height, top, duration, delay, opacity, id: i });
    }
    return items;
  }, []);

  return (
    <>
      <style>{`
        @keyframes cloud-drift {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(calc(100vw + 150px)); }
        }
      `}</style>
      {clouds.map((c) => (
        <div
          key={c.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: `${c.top}%`,
            left: "-150px",
            width: `${c.width}px`,
            height: `${c.height}px`,
            borderRadius: "50px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            opacity: c.opacity,
            animation: `cloud-drift ${c.duration}s ${c.delay}s linear infinite`,
            boxShadow: "0 4px 12px rgba(255,255,255,0.3)",
            pointerEvents: "none" as const,
          }}
        />
      ))}
    </>
  );
}

// 가을: 낙엽 날리기
function AutumnParticles() {
  const leaves = useMemo(() => {
    const items = [];
    const cfg: ParticleConfig = {
      count: 12,
      sizeRange: [12, 20],
      durationRange: [7, 14],
      delayRange: [0, 10],
    };
    const colors = ["#D2691E", "#CD853F", "#DAA520", "#B8860B", "#A0522D"];
    for (let i = 0; i < cfg.count; i++) {
      const size =
        cfg.sizeRange[0] + seededRandom(i) * (cfg.sizeRange[1] - cfg.sizeRange[0]);
      const left = seededRandom(i + 100) * 100;
      const duration =
        cfg.durationRange[0] +
        seededRandom(i + 200) * (cfg.durationRange[1] - cfg.durationRange[0]);
      const delay =
        cfg.delayRange[0] +
        seededRandom(i + 300) * (cfg.delayRange[1] - cfg.delayRange[0]);
      const color = colors[Math.floor(seededRandom(i + 400) * colors.length)];
      const swayAmount = 40 + seededRandom(i + 500) * 80;
      const rotateEnd = 180 + seededRandom(i + 600) * 360;
      items.push({ size, left, duration, delay, color, swayAmount, rotateEnd, id: i });
    }
    return items;
  }, []);

  return (
    <>
      <style>{`
        @keyframes leaf-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          50% { transform: translateY(50vh) translateX(var(--sway)) rotate(var(--rotate-half)); }
          90% { opacity: 0.5; }
          100% { transform: translateY(105vh) translateX(calc(var(--sway) * -0.5)) rotate(var(--rotate-end)); opacity: 0; }
        }
      `}</style>
      {leaves.map((l) => (
        <div
          key={l.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${l.left}%`,
            top: "-20px",
            width: `${l.size}px`,
            height: `${l.size}px`,
            backgroundColor: l.color,
            borderRadius: "0 50% 50% 50%",
            opacity: 0,
            animation: `leaf-fall ${l.duration}s ${l.delay}s ease-in-out infinite`,
            ["--sway" as string]: `${l.swayAmount}px`,
            ["--rotate-half" as string]: `${l.rotateEnd / 2}deg`,
            ["--rotate-end" as string]: `${l.rotateEnd}deg`,
            pointerEvents: "none" as const,
          }}
        />
      ))}
    </>
  );
}

// 겨울: 눈 내리기
function WinterParticles() {
  const snowflakes = useMemo(() => {
    const items = [];
    const cfg: ParticleConfig = {
      count: 25,
      sizeRange: [4, 10],
      durationRange: [5, 12],
      delayRange: [0, 8],
    };
    for (let i = 0; i < cfg.count; i++) {
      const size =
        cfg.sizeRange[0] + seededRandom(i) * (cfg.sizeRange[1] - cfg.sizeRange[0]);
      const left = seededRandom(i + 100) * 100;
      const duration =
        cfg.durationRange[0] +
        seededRandom(i + 200) * (cfg.durationRange[1] - cfg.durationRange[0]);
      const delay =
        cfg.delayRange[0] +
        seededRandom(i + 300) * (cfg.delayRange[1] - cfg.delayRange[0]);
      const swayAmount = 15 + seededRandom(i + 500) * 40;
      const opacity = 0.5 + seededRandom(i + 600) * 0.5;
      items.push({ size, left, duration, delay, swayAmount, opacity, id: i });
    }
    return items;
  }, []);

  return (
    <>
      <style>{`
        @keyframes snow-fall {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: var(--snow-opacity); }
          50% { transform: translateY(50vh) translateX(var(--sway)); }
          90% { opacity: var(--snow-opacity); }
          100% { transform: translateY(105vh) translateX(calc(var(--sway) * -1)); opacity: 0; }
        }
      `}</style>
      {snowflakes.map((s) => (
        <div
          key={s.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: "-10px",
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: 0,
            animation: `snow-fall ${s.duration}s ${s.delay}s ease-in-out infinite`,
            boxShadow: "0 0 4px rgba(255,255,255,0.8)",
            ["--sway" as string]: `${s.swayAmount}px`,
            ["--snow-opacity" as string]: `${s.opacity}`,
            pointerEvents: "none" as const,
          }}
        />
      ))}
    </>
  );
}

// ==================== 메인 컴포넌트 ====================

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
    <div className="min-h-dvh w-screen flex flex-col relative overflow-hidden">
      {/* 하늘 배경 */}
      <div
        className="absolute inset-0"
        style={{ background: theme.sky }}
      />

      {/* 계절별 애니메이션 파티클 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {season === "spring" && <SpringParticles />}
        {season === "summer" && <SummerParticles />}
        {season === "autumn" && <AutumnParticles />}
        {season === "winter" && <WinterParticles />}
      </div>

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
