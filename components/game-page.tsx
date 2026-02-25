/**
 * 게임 엔진 (Canvas 기반) — 오케스트레이터
 * - 레코드 모드 (무한) / 스테이지 모드 (정해진 파이프)
 * - 물리 엔진, 충돌 감지, 입력 처리, 게임 루프
 * - 실제 렌더링/액션/스폰/게임오버 처리는 lib/game/* 모듈에 위임
 */

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Home, RotateCcw, ChevronRight, List } from "lucide-react";
import { useSeason } from "@/lib/season-context";
import { getBirdById } from "@/lib/birds";
import { useUser } from "@/lib/user-context";
import { getHighScore as fetchHighScore } from "@/lib/user-service";
import type { BirdRarity } from "@/types/bird";
import { GAME_CONFIG, type GameStatus } from "@/types/game";
import type { StageConfig } from "@/types/stage";

// 추출된 게임 모듈
import {
  type GameStateRef,
  createInitialState,
  createEmptyGradientCache,
} from "@/lib/game/game-types";
import {
  spawnPipe,
  spawnItem,
  applyBreak,
  applyWraith,
  applyPoint,
  checkAABB,
} from "@/lib/game/game-actions";
import { spawnStagePipe } from "@/lib/game/stage-spawner";
import { buildGradientCache, renderFrame } from "@/lib/game/game-renderer";
import { handleGameOver, handleStageClear, type GameOverCallbacks } from "@/lib/game/game-over-handler";

// ==================== 메인 컴포넌트 ====================

interface GamePageProps {
  stageConfig?: StageConfig;
}

export default function GamePage({ stageConfig }: GamePageProps) {
  const router = useRouter();
  const { currentSeason } = useSeason();
  const { user, patchUser } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameStateRef | null>(null);
  const animFrameRef = useRef<number>(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const birdAspectRef = useRef<number>(1);
  const gradientCacheRef = useRef(createEmptyGradientCache());
  const userIdRef = useRef<string>("");
  const patchUserRef = useRef(patchUser);
  patchUserRef.current = patchUser;
  const userCoinsRef = useRef(0);
  const highScoreRef = useRef(0);

  // React 상태 (UI 표시용)
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coinReward, setCoinReward] = useState(0);
  const [progress, setProgress] = useState(0);

  // 장착된 새 정보
  const equippedBirdId = user?.equipped_bird_id ?? "bird_common_1";
  const equippedBird = getBirdById(equippedBirdId);
  const birdRarity: BirdRarity = equippedBird?.rarity || "common";

  // 유저 ref 동기화 + 최고점수 로드
  useEffect(() => {
    if (!user) return;
    userIdRef.current = user.id;
    userCoinsRef.current = user.coins;
    fetchHighScore(user.id).then((hs) => {
      highScoreRef.current = hs;
      setHighScore(hs);
      if (gameRef.current) gameRef.current.highScore = hs;
    });
  }, [user]);

  // 새 이미지 로드
  useEffect(() => {
    if (!equippedBird) return;
    if (equippedBird.imagePath === "svg") {
      const svgString = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="55" rx="35" ry="30" fill="#F9D71C"/>
        <ellipse cx="50" cy="60" rx="30" ry="22" fill="#F5AB35"/>
        <ellipse cx="55" cy="62" rx="18" ry="16" fill="#FFF8DC"/>
        <circle cx="62" cy="42" r="14" fill="white"/>
        <circle cx="62" cy="42" r="12" stroke="#333" stroke-width="2" fill="white"/>
        <circle cx="65" cy="42" r="6" fill="#333"/>
        <circle cx="67" cy="40" r="2" fill="white"/>
        <path d="M 75 52 L 95 55 L 75 62 Z" fill="#E84A3C"/>
        <path d="M 75 52 L 95 55 L 75 56 Z" fill="#F39C12"/>
        <ellipse cx="30" cy="55" rx="15" ry="10" fill="#E8B923"/>
        <ellipse cx="28" cy="55" rx="10" ry="6" fill="#D4A017"/>
        <path d="M 15 50 Q 5 45 10 55 Q 5 65 15 60 Z" fill="#E8B923"/>
      </svg>`;
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        birdImageRef.current = img;
        birdAspectRef.current = img.naturalHeight / img.naturalWidth;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        birdImageRef.current = img;
        birdAspectRef.current = img.naturalHeight / img.naturalWidth;
      };
      img.src = equippedBird.imagePath;
    }
  }, [equippedBird]);

  // ==================== 게임 루프 ====================

  const gameLoop = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const state = gameRef.current;
      if (!state) return;

      const { canvasWidth: W, canvasHeight: H } = state;
      const playableHeight = H - GAME_CONFIG.groundHeight;
      const birdW = GAME_CONFIG.birdWidth;
      const birdH = birdW * birdAspectRef.current;

      // === 업데이트 ===
      if (state.status === "playing") {
        state.frameCount++;

        // 델타타임 계산
        const now = performance.now();
        const rawDt = state.lastFrameTime > 0 ? (now - state.lastFrameTime) / (1000 / 60) : 1;
        const dt = Math.max(1, Math.min(rawDt, 3));
        state.lastFrameTime = now;

        // 글로벌 스피드 배수
        const speedMul = state.speedState === "fast"
          ? GAME_CONFIG.speedRingFastMultiplier
          : state.speedState === "slow"
            ? 1 / GAME_CONFIG.speedRingSlowDivisor
            : 1;

        // 새 물리 (텔레포트 중 스킵)
        if (!state.isTeleporting) {
          const grav = state.isGravityReversed ? -GAME_CONFIG.gravity : GAME_CONFIG.gravity;
          state.bird.velocity += grav * speedMul * dt;
          state.bird.y += state.bird.velocity * speedMul * dt;

          if (state.isGravityReversed) {
            state.bird.rotation = Math.min(30, Math.max(-90, -state.bird.velocity * 3));
            if (!state.isWraith && state.bird.y < 0) state.status = "gameover";
            if (state.bird.y < 0) { state.bird.y = 0; state.bird.velocity = 0; }
            if (state.bird.y + birdH > playableHeight) {
              state.bird.y = playableHeight - birdH;
              state.bird.velocity = 0;
            }
          } else {
            state.bird.rotation = Math.min(90, Math.max(-30, state.bird.velocity * 3));
            if (state.bird.y < 0) { state.bird.y = 0; state.bird.velocity = 0; }
            if (!state.isWraith && state.bird.y + birdH > playableHeight) state.status = "gameover";
            if (state.bird.y + birdH > playableHeight) {
              state.bird.y = playableHeight - birdH;
              state.bird.velocity = 0;
            }
          }
        }

        // 파이프 속도
        const basePipeSpeed = stageConfig ? stageConfig.pipeSpeed : GAME_CONFIG.pipeSpeed;
        const currentPipeSpeed = basePipeSpeed * speedMul * dt;

        // 파이프 생성
        if (stageConfig) {
          state.scrollDistance += currentPipeSpeed;
          if (
            state.nextPipeIndex < stageConfig.pipes.length &&
            state.scrollDistance >= state.nextPipeScrollDist
          ) {
            spawnStagePipe(state, stageConfig);
          }
        } else {
          state.scrollDistance += currentPipeSpeed;
          if (state.scrollDistance >= state.nextRecordPipeScrollDist) {
            spawnPipe(state);
            spawnItem(state);
            state.nextRecordPipeScrollDist += GAME_CONFIG.pipeSpawnInterval * GAME_CONFIG.pipeSpeed;
          }
        }

        // 파이프 이동 + 통과 체크
        for (let i = state.pipes.length - 1; i >= 0; i--) {
          const pipe = state.pipes[i];
          pipe.x -= currentPipeSpeed;

          if (!pipe.passed && pipe.x + pipe.width < state.bird.x) {
            pipe.passed = true;
            state.score++;

            // 스피드 링 효과
            if (pipe.speedRing) {
              state.speedState = pipe.speedRing;
              state.speedEndTime = Date.now() + GAME_CONFIG.speedRingDuration * 1000;
              state.speedTimeLeft = GAME_CONFIG.speedRingDuration;

              const bCX = state.bird.x + birdW / 2;
              const bCY = state.bird.y + birdH / 2;
              const color1 = pipe.speedRing === "slow" ? "#86EFAC" : "#FCA5A5";
              const color2 = pipe.speedRing === "slow" ? "#4ADE80" : "#EF4444";
              for (let k = 0; k < 14 && state.particles.length < GAME_CONFIG.maxParticles; k++) {
                const angle = (Math.PI * 2 * k) / 14;
                const speed = 1.5 + Math.random() * 2.5;
                state.particles.push({
                  x: bCX, y: bCY,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 3 + Math.random() * 4,
                  color: Math.random() > 0.5 ? color1 : color2,
                  alpha: 1, life: 25 + Math.random() * 15, maxLife: 40, type: "circle",
                });
              }
              state.screenFlash = {
                color: pipe.speedRing === "slow"
                  ? "rgba(74, 222, 128, 0.3)"
                  : "rgba(239, 68, 68, 0.3)",
                alpha: 1, life: 12,
              };
            }
          }

          if (pipe.x + pipe.width < -10) {
            state.pipes.splice(i, 1);
          }
        }

        // 텔레포트 파이프 닫히는 애니메이션
        for (const pipe of state.pipes) {
          if (pipe.isTeleportPipe && pipe.originalGapHeight) {
            const closeStartX = state.canvasWidth * 0.75;
            const closeEndX = state.canvasWidth * 0.35;
            if (pipe.x > closeStartX) {
              pipe.gapHeight = pipe.originalGapHeight;
            } else if (pipe.x < closeEndX) {
              pipe.gapHeight = 0;
            } else {
              const t = (pipe.x - closeEndX) / (closeStartX - closeEndX);
              pipe.gapHeight = pipe.originalGapHeight * t;
            }
          }
        }

        // 아이템 이동
        for (let i = state.items.length - 1; i >= 0; i--) {
          state.items[i].x -= currentPipeSpeed;
          if (state.items[i].x + state.items[i].size < -10) {
            state.items.splice(i, 1);
          }
        }

        // 포탈 이동
        for (let i = state.portals.length - 1; i >= 0; i--) {
          state.portals[i].x -= currentPipeSpeed;
          if (state.portals[i].x + state.portals[i].size < -60) {
            state.portals.splice(i, 1);
          }
        }

        // 중력 반전 존 이동 + 활성화 체크
        {
          const birdCenterX = state.bird.x + birdW / 2;
          let nowReversed = false;
          for (let i = state.gravityZones.length - 1; i >= 0; i--) {
            const zone = state.gravityZones[i];
            zone.startX -= currentPipeSpeed;
            zone.endX -= currentPipeSpeed;
            if (zone.endX < -100) {
              state.gravityZones.splice(i, 1);
              continue;
            }
            if (birdCenterX >= zone.startX && birdCenterX <= zone.endX) {
              nowReversed = true;
            }
          }
          if (nowReversed !== state.isGravityReversed) {
            state.isGravityReversed = nowReversed;
            state.bird.velocity = 0;
            state.screenFlash = {
              color: nowReversed ? "rgba(100, 50, 180, 0.35)" : "rgba(100, 50, 180, 0.25)",
              alpha: 1, life: 12,
            };
            const bCX = state.bird.x + birdW / 2;
            const bCY = state.bird.y + birdH / 2;
            for (let k = 0; k < 14 && state.particles.length < GAME_CONFIG.maxParticles; k++) {
              const angle = (Math.PI * 2 * k) / 14;
              const speed = 1.5 + Math.random() * 2.5;
              state.particles.push({
                x: bCX, y: bCY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: Math.random() > 0.5 ? "#7C3AED" : "#A78BFA",
                alpha: 1, life: 25 + Math.random() * 15, maxLife: 40, type: "circle",
              });
            }
          }
        }

        // 텔레포트 IN 포탈 충돌 감지
        if (!state.isTeleporting) {
          const bx = state.bird.x + GAME_CONFIG.birdHitboxPadding;
          const by = state.bird.y + GAME_CONFIG.birdHitboxPadding;
          const bw = birdW - GAME_CONFIG.birdHitboxPadding * 2;
          const bh = birdH - GAME_CONFIG.birdHitboxPadding * 2;

          for (const portal of state.portals) {
            if (portal.type !== "in" || portal.activated) continue;
            const px = portal.x - portal.size / 2;
            const py = portal.y - portal.size / 2;
            if (checkAABB(bx, by, bw, bh, px, py, portal.size, portal.size)) {
              state.isTeleporting = true;
              portal.activated = true;
              const outPortal = state.portals.find(
                (p) => p.type === "out" && p.pairId === portal.pairId
              );
              state.teleportOutPortal = outPortal || null;
              state.teleportPipe = state.pipes.find((p) => p.id === portal.pipeId) || null;

              for (let k = 0; k < 16 && state.particles.length < GAME_CONFIG.maxParticles; k++) {
                const angle = (Math.PI * 2 * k) / 16;
                const dist = 30 + Math.random() * 20;
                state.particles.push({
                  x: portal.x + Math.cos(angle) * dist,
                  y: portal.y + Math.sin(angle) * dist * 0.5,
                  vx: -Math.cos(angle) * (1.5 + Math.random()),
                  vy: -Math.sin(angle) * (1 + Math.random()) * 0.5,
                  size: 3 + Math.random() * 4,
                  color: Math.random() > 0.5 ? "#FBBF24" : "#FDE047",
                  alpha: 1, life: 20 + Math.random() * 10, maxLife: 30, type: "circle",
                });
              }
              state.screenFlash = { color: "rgba(251, 191, 36, 0.3)", alpha: 1, life: 10 };
              break;
            }
          }
        }

        // 텔레포트 중: OUT 포탈 도달 체크
        if (state.isTeleporting && state.teleportOutPortal) {
          const out = state.teleportOutPortal;
          if (out.x <= state.bird.x + birdW / 2) {
            state.isTeleporting = false;
            state.bird.y = out.y - birdH / 2;
            state.bird.velocity = 0;
            state.bird.rotation = 0;
            out.activated = true;
            state.teleportOutPortal = null;

            if (state.teleportPipe && !state.teleportPipe.passed) {
              state.teleportPipe.passed = true;
              state.score++;
            }
            state.teleportPipe = null;

            const bCX = state.bird.x + birdW / 2;
            const bCY = state.bird.y + birdH / 2;
            for (let k = 0; k < 20 && state.particles.length < GAME_CONFIG.maxParticles; k++) {
              const angle = (Math.PI * 2 * k) / 20;
              const speed = 2 + Math.random() * 3;
              state.particles.push({
                x: bCX, y: bCY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 5,
                color: Math.random() > 0.4 ? "#FBBF24" : "#FDE047",
                alpha: 1, life: 30 + Math.random() * 15, maxLife: 45, type: "circle",
              });
            }
            state.screenFlash = { color: "rgba(251, 191, 36, 0.3)", alpha: 1, life: 12 };
          }
        }

        // 파티클 업데이트
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += (p.type === "circle" ? 0.05 : 0.3) * dt;
          p.life -= dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            const last = state.particles.length - 1;
            if (i !== last) state.particles[i] = state.particles[last];
            state.particles.pop();
          }
        }

        // 플로팅 텍스트 업데이트
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life -= dt;
          ft.alpha = Math.max(0, ft.life / 50);
          if (ft.life <= 0) {
            const last = state.floatingTexts.length - 1;
            if (i !== last) state.floatingTexts[i] = state.floatingTexts[last];
            state.floatingTexts.pop();
          }
        }

        // 화면 플래시 업데이트
        if (state.screenFlash) {
          state.screenFlash.life -= dt;
          state.screenFlash.alpha = Math.max(0, state.screenFlash.life / 15);
          if (state.screenFlash.life <= 0) state.screenFlash = null;
        }

        // 파이프 충돌 감지
        if (!state.isWraith && !state.isTeleporting) {
          const bx = state.bird.x + GAME_CONFIG.birdHitboxPadding;
          const by = state.bird.y + GAME_CONFIG.birdHitboxPadding;
          const bw = birdW - GAME_CONFIG.birdHitboxPadding * 2;
          const bh = birdH - GAME_CONFIG.birdHitboxPadding * 2;

          for (const pipe of state.pipes) {
            const topPipeH = pipe.gapY - pipe.gapHeight / 2;
            const bottomPipeY = pipe.gapY + pipe.gapHeight / 2;
            const bottomPipeH = playableHeight - bottomPipeY;
            if (
              checkAABB(bx, by, bw, bh, pipe.x, 0, pipe.width, topPipeH) ||
              checkAABB(bx, by, bw, bh, pipe.x, bottomPipeY, pipe.width, bottomPipeH)
            ) {
              state.status = "gameover";
              break;
            }
          }
        }

        // 아이템 충돌 감지
        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];
          if (item.collected) continue;
          if (
            checkAABB(
              state.bird.x, state.bird.y, birdW, birdH,
              item.x - item.size / 2, item.y - item.size / 2, item.size, item.size
            )
          ) {
            item.collected = true;
            switch (item.type) {
              case "break": applyBreak(state, currentSeason); break;
              case "wraith": applyWraith(state, birdAspectRef.current); break;
              case "point": applyPoint(state, birdAspectRef.current); break;
            }
            state.items.splice(i, 1);
          }
        }

        // wraith 타이머
        if (state.isWraith) {
          const msLeft = state.wraithEndTime - Date.now();
          if (msLeft <= 0) { state.isWraith = false; state.wraithTimeLeft = 0; }
          else state.wraithTimeLeft = Math.ceil(msLeft / 1000);
        }

        // 스피드 링 타이머
        if (state.speedState) {
          const msLeft = state.speedEndTime - Date.now();
          if (msLeft <= 0) { state.speedState = null; state.speedTimeLeft = 0; }
          else state.speedTimeLeft = Math.ceil(msLeft / 1000);
        }

        // 게임오버 콜백 준비
        const cb: GameOverCallbacks = {
          userId: userIdRef.current,
          highScoreRef,
          userCoinsRef,
          patchUser: (u) => patchUserRef.current(u),
          setScore, setHighScore, setCoinReward, setProgress, setGameStatus,
        };

        // 스테이지 클리어 체크
        if (stageConfig && state.status === "playing" && state.score >= stageConfig.goalScore) {
          handleStageClear(state, stageConfig, cb);
          return;
        }

        // 게임오버 처리
        if (state.status === "gameover") {
          handleGameOver(state, stageConfig, cb);
          return;
        }

        setScore(state.score);
      }

      // === 렌더링 ===
      renderFrame(ctx, state, {
        season: currentSeason,
        stageConfig,
        birdImage: birdImageRef.current,
        birdAspect: birdAspectRef.current,
        cache: gradientCacheRef.current,
      });

      // 다음 프레임
      if (state.status !== "gameover" && state.status !== "clear") {
        animFrameRef.current = requestAnimationFrame(() => gameLoop(ctx));
      }
    },
    [currentSeason, stageConfig]
  );

  // ==================== Canvas 초기화 ====================

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const hs = highScore;

    gameRef.current = createInitialState(W, H, birdRarity, hs);
    buildGradientCache(ctx, H, currentSeason, gradientCacheRef.current);
    setGameStatus("ready");
    setScore(0);
    setCoinReward(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => gameLoop(ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birdRarity, gameLoop, currentSeason]);

  useEffect(() => {
    initGame();
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initGame]);

  // 리사이즈 (게임 중이 아닐 때만)
  useEffect(() => {
    const handleResize = () => {
      if (gameRef.current?.status === "playing") return;
      initGame();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initGame]);

  // ==================== 입력 핸들러 ====================

  const handleTap = useCallback(() => {
    const state = gameRef.current;
    if (!state) return;

    if (state.status === "ready") {
      state.status = "playing";
      setGameStatus("playing");
      state.bird.velocity = GAME_CONFIG.jumpForce;
      state.playStartTime = Date.now();
      state.lastFrameTime = performance.now();
    } else if (state.status === "playing" && !state.isTeleporting) {
      const jump = state.isGravityReversed ? -GAME_CONFIG.jumpForce : GAME_CONFIG.jumpForce;
      state.bird.velocity = jump;
    }
  }, []);

  const handleRestart = useCallback(() => {
    initGame();
  }, [initGame]);

  const handleGoHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  // 키보드
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameStatus === "gameover" || gameStatus === "clear") return;
        handleTap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap, gameStatus]);

  // ==================== JSX ====================

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        onPointerDown={
          gameStatus !== "gameover" && gameStatus !== "clear"
            ? (e) => {
                e.preventDefault();
                handleTap();
              }
            : undefined
        }
      />

      {/* 게임오버 모달 */}
      {gameStatus === "gameover" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 py-2">
              <h2 className="text-white text-lg font-bold text-center">
                Game Over
              </h2>
            </div>

            <div className="p-3 space-y-2">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-0.5">
                  {stageConfig ? "Progress" : "Score"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stageConfig ? `${progress}%` : score}
                </p>
              </div>

              {!stageConfig && (
                <div className="text-center">
                  <p className="text-gray-500 text-xs mb-0.5">Best</p>
                  <p className="text-lg font-bold text-yellow-500">
                    {highScore}
                  </p>
                </div>
              )}

              {coinReward > 0 && (
                <div className="text-center bg-yellow-50 rounded-lg py-1 px-3">
                  <p className="text-yellow-700 font-bold text-xs">
                    +{coinReward} Coins
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={stageConfig ? () => router.push("/stage-select") : handleGoHome}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  {stageConfig ? (
                    <><List className="w-4 h-4" />Stages</>
                  ) : (
                    <><Home className="w-4 h-4" />Home</>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 스테이지 클리어 모달 */}
      {gameStatus === "clear" && stageConfig && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-64 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 py-2">
              <h2 className="text-white text-lg font-bold text-center">
                Stage Clear!
              </h2>
            </div>

            <div className="p-3 space-y-2">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-0.5">
                  Stage {stageConfig.id} - {stageConfig.name}
                </p>
                <p className="text-2xl font-bold text-gray-800">100%</p>
              </div>

              {coinReward > 0 && (
                <div className="text-center bg-yellow-50 rounded-lg py-1 px-3">
                  <p className="text-yellow-700 font-bold text-xs">
                    +{coinReward} Coins
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => router.push("/stage-select")}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <List className="w-4 h-4" />
                  Stages
                </button>
                <button
                  onClick={() => router.push(`/stage/${stageConfig.id + 1}`)}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
