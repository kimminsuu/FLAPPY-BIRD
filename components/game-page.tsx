"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Home, RotateCcw, ChevronRight, List } from "lucide-react";
import { useSeason } from "@/lib/season-context";
import { getBirdById } from "@/lib/birds";
import { addUserCoins } from "@/components/ui/UserInfoBar";
import type { BirdRarity } from "@/types/bird";
import {
  GAME_CONFIG,
  ITEM_SPAWN_INTERVALS,
  ITEM_TYPES,
  PIPE_COLORS,
  type GameStatus,
  type BirdState,
  type Pipe,
  type GameItem,
  type Particle,
  type FloatingText,
  type ScreenFlash,
} from "@/types/game";
import type { StageConfig } from "@/types/stage";

// ==================== 스테이지 최고 기록 헬퍼 ====================

function getStageBest(username: string, stageId: number): number {
  try {
    const raw = localStorage.getItem(`flappy_stage_best_${username}`);
    if (!raw) return 0;
    const data: Record<string, number> = JSON.parse(raw);
    return data[String(stageId)] ?? 0;
  } catch {
    return 0;
  }
}

function setStageBest(username: string, stageId: number, percent: number): void {
  try {
    const key = `flappy_stage_best_${username}`;
    const raw = localStorage.getItem(key);
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    const prev = data[String(stageId)] ?? 0;
    if (percent > prev) {
      data[String(stageId)] = percent;
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

// ==================== 스테이지 총 프레임 계산 ====================

function calcStageTotalFrames(cfg: StageConfig, canvasWidth: number): number {
  // 각 파이프의 실제 spacing을 합산
  let spawnFrames = cfg.pipes[0]?.spacing ?? cfg.pipeSpacing; // 첫 파이프 스폰까지
  for (let i = 1; i < cfg.pipes.length; i++) {
    spawnFrames += cfg.pipes[i].spacing ?? cfg.pipeSpacing;
  }
  // 마지막 파이프가 새 위치까지 이동하는 시간
  const pipeTravelFrames = Math.ceil(canvasWidth / cfg.pipeSpeed);
  return spawnFrames + pipeTravelFrames;
}

// ==================== 게임 상태 (ref로 관리) ====================

interface GameStateRef {
  status: GameStatus;
  score: number;
  highScore: number;
  bird: BirdState;
  pipes: Pipe[];
  items: GameItem[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  screenFlash: ScreenFlash | null;
  frameCount: number;
  isWraith: boolean;
  wraithEndTime: number; // Date.now() 기준 종료 시각
  wraithTimeLeft: number;
  birdRarity: BirdRarity;
  lastItemSpawnRealTime: number; // Date.now() 기준
  canvasWidth: number;
  canvasHeight: number;
  nextPipeIndex: number; // 스테이지 모드: 다음 스폰할 파이프 인덱스
  nextPipeFrame: number; // 스테이지 모드: 다음 파이프 스폰 프레임
}

function createInitialState(
  canvasWidth: number,
  canvasHeight: number,
  rarity: BirdRarity,
  highScore: number
): GameStateRef {
  return {
    status: "ready",
    score: 0,
    highScore,
    bird: {
      x: canvasWidth * 0.25,
      y: canvasHeight * 0.4,
      velocity: 0,
      rotation: 0,
    },
    pipes: [],
    items: [],
    particles: [],
    floatingTexts: [],
    screenFlash: null,
    frameCount: 0,
    isWraith: false,
    wraithEndTime: 0,
    wraithTimeLeft: 0,
    birdRarity: rarity,
    lastItemSpawnRealTime: 0,
    canvasWidth,
    canvasHeight,
    nextPipeIndex: 0,
    nextPipeFrame: 0,
  };
}

// ==================== 메인 컴포넌트 ====================

interface GamePageProps {
  stageConfig?: StageConfig;
}

export default function GamePage({ stageConfig }: GamePageProps) {
  const router = useRouter();
  const { currentSeason } = useSeason();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameStateRef | null>(null);
  const animFrameRef = useRef<number>(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const birdAspectRef = useRef<number>(1); // height / width 비율

  // React 상태 (UI 표시용)
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coinReward, setCoinReward] = useState(0);
  const [progress, setProgress] = useState(0);

  // 장착된 새 정보
  const equippedBirdId =
    typeof window !== "undefined"
      ? localStorage.getItem("flappy_equipped_bird") || "bird_common_1"
      : "bird_common_1";
  const equippedBird = getBirdById(equippedBirdId);
  const birdRarity: BirdRarity = equippedBird?.rarity || "common";

  // 최고점수 로드
  useEffect(() => {
    const saved = localStorage.getItem("flappy_high_score");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) setHighScore(parsed);
    }
  }, []);

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

  // ==================== 게임 로직 함수 ====================

  const spawnPipe = useCallback((state: GameStateRef) => {
    const { canvasWidth, canvasHeight } = state;
    const playableHeight = canvasHeight - GAME_CONFIG.groundHeight;
    const gapHeight =
      GAME_CONFIG.pipeGapMin +
      Math.random() * (GAME_CONFIG.pipeGapMax - GAME_CONFIG.pipeGapMin);
    const minGapY = gapHeight / 2 + 40;
    const maxGapY = playableHeight - gapHeight / 2 - 40;

    // 이전 파이프 gap 중심과의 y 거리를 화면의 2/5 이내로 제한
    const maxYDiff = playableHeight * (1 / 3);
    const prevPipe = state.pipes[state.pipes.length - 1];
    let gapY: number;

    if (prevPipe) {
      const lower = Math.max(minGapY, prevPipe.gapY - maxYDiff);
      const upper = Math.min(maxGapY, prevPipe.gapY + maxYDiff);
      gapY = lower + Math.random() * (upper - lower);
    } else {
      gapY = minGapY + Math.random() * (maxGapY - minGapY);
    }

    state.pipes.push({
      x: canvasWidth + 10,
      gapY,
      gapHeight,
      passed: false,
      width: GAME_CONFIG.pipeWidth,
    });
  }, []);

  const spawnItem = useCallback((state: GameStateRef) => {
    const interval = ITEM_SPAWN_INTERVALS[state.birdRarity];
    if (interval === 0) return;

    const now = Date.now();
    const intervalMs = interval * 1000;
    if (
      now - state.lastItemSpawnRealTime < intervalMs &&
      state.lastItemSpawnRealTime !== 0
    )
      return;

    const recentPipe = state.pipes[state.pipes.length - 1];
    if (!recentPipe) return;

    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    const itemY =
      recentPipe.gapY -
      recentPipe.gapHeight / 2 +
      Math.random() * recentPipe.gapHeight;

    state.items.push({
      x: recentPipe.x + recentPipe.width / 2,
      y: itemY,
      type,
      collected: false,
      size: GAME_CONFIG.itemSize,
    });

    state.lastItemSpawnRealTime = now;
  }, []);

  const applyBreak = useCallback(
    (state: GameStateRef) => {
      const playableHeight =
        state.canvasHeight - GAME_CONFIG.groundHeight;
      const colors = PIPE_COLORS[currentSeason] || PIPE_COLORS.summer;
      let bonusScore = 0;

      for (const pipe of state.pipes) {
        if (!pipe.passed) {
          bonusScore++;
          pipe.passed = true;
        }

        const topH = pipe.gapY - pipe.gapHeight / 2;
        const bottomY = pipe.gapY + pipe.gapHeight / 2;
        const bottomH = playableHeight - bottomY;

        // 상단 파이프 조각
        const topChunks = Math.ceil(topH / 20);
        for (let i = 0; i < topChunks; i++) {
          const py = (topH / topChunks) * i + 10;
          for (let j = 0; j < 3; j++) {
            state.particles.push({
              x: pipe.x + Math.random() * pipe.width,
              y: py,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 1) * 6,
              size: 6 + Math.random() * 8,
              color: Math.random() > 0.5 ? colors.body : colors.highlight,
              alpha: 1,
              life: 40 + Math.random() * 20,
              maxLife: 50,
            });
          }
        }

        // 하단 파이프 조각
        const bottomChunks = Math.ceil(bottomH / 20);
        for (let i = 0; i < bottomChunks; i++) {
          const py = bottomY + (bottomH / bottomChunks) * i + 10;
          for (let j = 0; j < 3; j++) {
            state.particles.push({
              x: pipe.x + Math.random() * pipe.width,
              y: py,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 1) * 6,
              size: 6 + Math.random() * 8,
              color: Math.random() > 0.5 ? colors.body : colors.highlight,
              alpha: 1,
              life: 40 + Math.random() * 20,
              maxLife: 50,
            });
          }
        }
      }

      state.score += bonusScore;
      state.pipes = [];
    },
    [currentSeason]
  );

  const applyWraith = useCallback((state: GameStateRef) => {
    const bx = state.bird.x + GAME_CONFIG.birdWidth / 2;
    const by = state.bird.y + GAME_CONFIG.birdWidth * birdAspectRef.current / 2;

    state.isWraith = true;
    state.wraithEndTime = Date.now() + GAME_CONFIG.wraithDuration * 1000;
    state.wraithTimeLeft = GAME_CONFIG.wraithDuration;

    // 보라색 원형 파티클 방사
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const speed = 2 + Math.random() * 3;
      state.particles.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? "#A855F7" : "#7C3AED",
        alpha: 1,
        life: 30 + Math.random() * 15,
        maxLife: 45,
        type: "circle",
      });
    }

    // 화면 보라색 플래시
    state.screenFlash = { color: "rgba(168, 85, 247, 0.3)", alpha: 1, life: 15 };
  }, []);

  const applyPoint = useCallback((state: GameStateRef) => {
    const bx = state.bird.x + GAME_CONFIG.birdWidth / 2;
    const by = state.bird.y + GAME_CONFIG.birdWidth * birdAspectRef.current / 2;

    state.score += 5;

    // 금색 스파클 파티클
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 1.5 + Math.random() * 2.5;
      state.particles.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.3 ? "#FBBF24" : "#F59E0B",
        alpha: 1,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        type: "circle",
      });
    }

    // "+5" 플로팅 텍스트
    state.floatingTexts.push({
      x: bx,
      y: by - 20,
      text: "+5",
      color: "#FBBF24",
      fontSize: 28,
      alpha: 1,
      life: 50,
      vy: -1.5,
    });

    // 화면 금색 플래시
    state.screenFlash = { color: "rgba(251, 191, 36, 0.25)", alpha: 1, life: 10 };
  }, []);

  const checkAABB = useCallback(
    (
      ax: number, ay: number, aw: number, ah: number,
      bx: number, by: number, bw: number, bh: number
    ) => {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    },
    []
  );

  // ==================== 게임 루프 ====================

  const gameLoop = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const state = gameRef.current;
      if (!state) return;

      const { canvasWidth: W, canvasHeight: H } = state;
      const playableHeight = H - GAME_CONFIG.groundHeight;
      const pipeColors = PIPE_COLORS[currentSeason] || PIPE_COLORS.summer;
      const birdW = GAME_CONFIG.birdWidth;
      const birdH = birdW * birdAspectRef.current;

      // === 업데이트 ===
      if (state.status === "playing") {
        state.frameCount++;

        // 새 물리
        state.bird.velocity += GAME_CONFIG.gravity;
        state.bird.y += state.bird.velocity;
        state.bird.rotation = Math.min(
          90,
          Math.max(-30, state.bird.velocity * 3)
        );

        // 천장 제한
        if (state.bird.y < 0) {
          state.bird.y = 0;
          state.bird.velocity = 0;
        }

        // 바닥 충돌
        if (
          !state.isWraith &&
          state.bird.y + birdH > playableHeight
        ) {
          state.status = "gameover";
        }
        // 바닥 아래로 내려가지 않도록 제한
        if (state.bird.y + birdH > playableHeight) {
          state.bird.y = playableHeight - birdH;
          state.bird.velocity = 0;
        }

        // 파이프 생성
        if (stageConfig) {
          // STAGE 모드: per-pipe spacing 지원
          if (
            state.nextPipeIndex < stageConfig.pipes.length &&
            state.frameCount >= state.nextPipeFrame
          ) {
            const pipeDef = stageConfig.pipes[state.nextPipeIndex];
            const playH = state.canvasHeight - GAME_CONFIG.groundHeight;
            const margin = pipeDef.gapHeight / 2 + 40;
            const gapY = margin + pipeDef.gapY * (playH - margin * 2);
            state.pipes.push({
              x: state.canvasWidth + 10,
              gapY,
              gapHeight: pipeDef.gapHeight,
              passed: false,
              width: GAME_CONFIG.pipeWidth,
            });
            state.nextPipeIndex++;
            // 다음 파이프 스폰 프레임 계산
            if (state.nextPipeIndex < stageConfig.pipes.length) {
              const nextDef = stageConfig.pipes[state.nextPipeIndex];
              state.nextPipeFrame =
                state.frameCount + (nextDef.spacing ?? stageConfig.pipeSpacing);
            }
            // 아이템 생성
            if (stageConfig.enableItems) {
              spawnItem(state);
            }
          }
        } else {
          // RECORD 모드: 고정 간격
          const spawnInterval = GAME_CONFIG.pipeSpawnInterval;
          if (state.frameCount % spawnInterval === 0) {
            spawnPipe(state);
            spawnItem(state);
          }
        }

        // 파이프 이동 + 통과 체크
        const currentPipeSpeed = stageConfig
          ? stageConfig.pipeSpeed
          : GAME_CONFIG.pipeSpeed;
        for (let i = state.pipes.length - 1; i >= 0; i--) {
          const pipe = state.pipes[i];
          pipe.x -= currentPipeSpeed;

          if (!pipe.passed && pipe.x + pipe.width < state.bird.x) {
            pipe.passed = true;
            state.score++;
          }

          if (pipe.x + pipe.width < -10) {
            state.pipes.splice(i, 1);
          }
        }

        // 아이템 이동
        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];
          item.x -= currentPipeSpeed;

          if (item.x + item.size < -10) {
            state.items.splice(i, 1);
          }
        }

        // 파티클 업데이트
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.type === "circle" ? 0.05 : 0.3;
          p.life--;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            state.particles.splice(i, 1);
          }
        }

        // 플로팅 텍스트 업데이트
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y += ft.vy;
          ft.life--;
          ft.alpha = Math.max(0, ft.life / 50);
          if (ft.life <= 0) {
            state.floatingTexts.splice(i, 1);
          }
        }

        // 화면 플래시 업데이트
        if (state.screenFlash) {
          state.screenFlash.life--;
          state.screenFlash.alpha = Math.max(
            0,
            state.screenFlash.life / 15
          );
          if (state.screenFlash.life <= 0) {
            state.screenFlash = null;
          }
        }

        // 파이프 충돌 감지
        if (!state.isWraith) {
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
              checkAABB(
                bx, by, bw, bh,
                pipe.x, bottomPipeY, pipe.width, bottomPipeH
              )
            ) {
              state.status = "gameover";
              break;
            }
          }
        }

        // 아이템 충돌 감지
        const bx2 = state.bird.x;
        const by2 = state.bird.y;

        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];
          if (item.collected) continue;

          if (
            checkAABB(
              bx2, by2, birdW, birdH,
              item.x - item.size / 2,
              item.y - item.size / 2,
              item.size,
              item.size
            )
          ) {
            item.collected = true;
            switch (item.type) {
              case "break":
                applyBreak(state);
                break;
              case "wraith":
                applyWraith(state);
                break;
              case "point":
                applyPoint(state);
                break;
            }
            state.items.splice(i, 1);
          }
        }

        // wraith 타이머 (실제 시간 기반)
        if (state.isWraith) {
          const msLeft = state.wraithEndTime - Date.now();
          if (msLeft <= 0) {
            state.isWraith = false;
            state.wraithTimeLeft = 0;
          } else {
            state.wraithTimeLeft = Math.ceil(msLeft / 1000);
          }
        }

        // 스테이지 클리어 체크
        if (
          stageConfig &&
          state.status === "playing" &&
          state.score >= stageConfig.goalScore
        ) {
          state.status = "clear";
          setProgress(100);
          const username = (() => { try { return JSON.parse(localStorage.getItem("flappy_auth_user") || "{}").username || ""; } catch { return ""; } })();
          if (username) setStageBest(username, stageConfig.id, 100);
          const reward = state.score * GAME_CONFIG.coinRewardMultiplier;
          addUserCoins(reward);
          setCoinReward(reward);
          setScore(state.score);
          setGameStatus("clear");
          return;
        }

        // 게임오버 처리
        if (state.status === "gameover") {
          if (stageConfig) {
            // 스테이지 모드: 프레임 기반 정확한 진행률 (per-pipe spacing 합산)
            const totalFrames = calcStageTotalFrames(stageConfig, state.canvasWidth);
            const finalPct = Math.min(99, Math.floor((state.frameCount / totalFrames) * 100));
            setProgress(finalPct);
            const username = (() => { try { return JSON.parse(localStorage.getItem("flappy_auth_user") || "{}").username || ""; } catch { return ""; } })();
            if (username) setStageBest(username, stageConfig.id, finalPct);
          } else {
            // RECORD 모드: 최고점수 저장
            if (state.score > state.highScore) {
              state.highScore = state.score;
              localStorage.setItem(
                "flappy_high_score",
                state.highScore.toString()
              );
            }
          }
          const reward = state.score * GAME_CONFIG.coinRewardMultiplier;
          addUserCoins(reward);
          setCoinReward(reward);
          setScore(state.score);
          setHighScore(state.highScore);
          setGameStatus("gameover");
          return;
        }

        setScore(state.score);
      }

      // === 렌더링 ===

      // 하늘 배경
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      switch (currentSeason) {
        case "spring":
          skyGrad.addColorStop(0, "#87CEEB");
          skyGrad.addColorStop(0.5, "#B0E0E6");
          skyGrad.addColorStop(1, "#98D8C8");
          break;
        case "summer":
          skyGrad.addColorStop(0, "#4EC0CA");
          skyGrad.addColorStop(0.5, "#71C5CF");
          skyGrad.addColorStop(1, "#87CEEB");
          break;
        case "autumn":
          skyGrad.addColorStop(0, "#F4A460");
          skyGrad.addColorStop(0.5, "#DEB887");
          skyGrad.addColorStop(1, "#D2B48C");
          break;
        case "winter":
          skyGrad.addColorStop(0, "#B0C4DE");
          skyGrad.addColorStop(0.5, "#87CEEB");
          skyGrad.addColorStop(1, "#E0FFFF");
          break;
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // 파이프
      for (const pipe of state.pipes) {
        const topH = pipe.gapY - pipe.gapHeight / 2;
        const bottomY = pipe.gapY + pipe.gapHeight / 2;
        const bottomH = playableHeight - bottomY;
        const pw = pipe.width;
        const px = pipe.x;
        const capH = 30;
        const capOverhang = 5;

        // --- 파이프 몸체 그리기 헬퍼 ---
        const drawPipeBody = (x: number, y: number, w: number, h: number) => {
          if (h <= 0) return;
          // 몸체 좌→우 그라데이션 (입체감)
          const bodyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
          bodyGrad.addColorStop(0, pipeColors.highlight);
          bodyGrad.addColorStop(0.15, pipeColors.body);
          bodyGrad.addColorStop(0.5, pipeColors.body);
          bodyGrad.addColorStop(0.85, pipeColors.highlight);
          bodyGrad.addColorStop(1, pipeColors.highlight);
          ctx.fillStyle = bodyGrad;
          ctx.fillRect(x, y, w, h);

          // 왼쪽 하이라이트 줄
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.fillRect(x + 4, y, 6, h);
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(x + 12, y, 3, h);

          // 오른쪽 그림자 줄
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(x + w - 8, y, 5, h);
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fillRect(x + w - 14, y, 3, h);

          // 수평 세그먼트 라인 (마디)
          ctx.strokeStyle = "rgba(0,0,0,0.07)";
          ctx.lineWidth = 1;
          const segmentHeight = 28;
          const startSeg = Math.ceil(y / segmentHeight) * segmentHeight;
          for (let sy = startSeg; sy < y + h; sy += segmentHeight) {
            ctx.beginPath();
            ctx.moveTo(x + 2, sy);
            ctx.lineTo(x + w - 2, sy);
            ctx.stroke();
          }

          // 외곽선
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 0.5, y, w - 1, h);
        };

        // --- 캡 그리기 헬퍼 ---
        const drawPipeCap = (x: number, y: number, w: number, h: number) => {
          // 캡은 highlight를 메인, 가장자리는 더 어둡게
          const capGrad = ctx.createLinearGradient(x, 0, x + w, 0);
          capGrad.addColorStop(0, pipeColors.capEdge);
          capGrad.addColorStop(0.15, pipeColors.highlight);
          capGrad.addColorStop(0.5, pipeColors.highlight);
          capGrad.addColorStop(0.85, pipeColors.highlight);
          capGrad.addColorStop(1, pipeColors.capEdge);
          ctx.fillStyle = capGrad;

          // 둥근 모서리 캡
          const r = 4;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.arcTo(x + w, y, x + w, y + r, r);
          ctx.lineTo(x + w, y + h - r);
          ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
          ctx.lineTo(x + r, y + h);
          ctx.arcTo(x, y + h, x, y + h - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
          ctx.fill();

          // 캡 상단 하이라이트
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          ctx.fillRect(x + 3, y + 2, w - 6, 4);

          // 캡 하단 그림자
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(x + 3, y + h - 5, w - 6, 3);

          // 캡 왼쪽 하이라이트
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(x + 2, y + 4, 5, h - 8);

          // 캡 외곽선
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.arcTo(x + w, y, x + w, y + r, r);
          ctx.lineTo(x + w, y + h - r);
          ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
          ctx.lineTo(x + r, y + h);
          ctx.arcTo(x, y + h, x, y + h - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
          ctx.stroke();
        };

        // 상단 파이프
        drawPipeBody(px, 0, pw, topH - capH);
        drawPipeCap(px - capOverhang, topH - capH, pw + capOverhang * 2, capH);

        // 하단 파이프
        drawPipeCap(px - capOverhang, bottomY, pw + capOverhang * 2, capH);
        drawPipeBody(px, bottomY + capH, pw, bottomH - capH);
      }

      // 파티클
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        if (p.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.rotate(p.life * 0.1);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }

      // 잔디
      const grassGrad = ctx.createLinearGradient(0, playableHeight, 0, H);
      switch (currentSeason) {
        case "spring":
          grassGrad.addColorStop(0, "#8BC34A");
          grassGrad.addColorStop(0.2, "#7CB342");
          grassGrad.addColorStop(1, "#558B2F");
          break;
        case "summer":
          grassGrad.addColorStop(0, "#7CB342");
          grassGrad.addColorStop(0.2, "#5B8C3E");
          grassGrad.addColorStop(1, "#4A7A2E");
          break;
        case "autumn":
          grassGrad.addColorStop(0, "#D2691E");
          grassGrad.addColorStop(0.2, "#CD853F");
          grassGrad.addColorStop(1, "#8B4513");
          break;
        case "winter":
          grassGrad.addColorStop(0, "#FFFAFA");
          grassGrad.addColorStop(0.2, "#F0F8FF");
          grassGrad.addColorStop(1, "#E8E8E8");
          break;
      }
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, playableHeight, W, GAME_CONFIG.groundHeight);

      // 아이템
      for (const item of state.items) {
        if (item.collected) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);

        switch (item.type) {
          case "break":
            ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `${item.size * 0.55}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\u{1F4A5}", item.x, item.y);
            break;
          case "wraith":
            ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `${item.size * 0.55}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\u{1F47B}", item.x, item.y);
            break;
          case "point":
            ctx.fillStyle = "rgba(234, 179, 8, 0.9)";
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `${item.size * 0.55}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\u2B50", item.x, item.y);
            break;
        }
        ctx.restore();
      }

      // 새
      ctx.save();
      const birdCX = state.bird.x + birdW / 2;
      const birdCY = state.bird.y + birdH / 2;
      ctx.translate(birdCX, birdCY);
      ctx.rotate((state.bird.rotation * Math.PI) / 180);

      if (state.isWraith) {
        ctx.globalAlpha = 0.4;
      }

      if (birdImageRef.current) {
        ctx.drawImage(
          birdImageRef.current,
          -birdW / 2,
          -birdH / 2,
          birdW,
          birdH
        );
      } else {
        ctx.fillStyle = "#F9D71C";
        ctx.beginPath();
        ctx.ellipse(0, 0, birdW / 2, birdH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 화면 플래시
      if (state.screenFlash) {
        ctx.save();
        ctx.globalAlpha = state.screenFlash.alpha;
        ctx.fillStyle = state.screenFlash.color;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // 플로팅 텍스트
      for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 3;
        ctx.font = `bold ${ft.fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 점수 HUD (스테이지 모드: 진행률%, 레코드 모드: 점수)
      ctx.save();
      ctx.fillStyle = "white";
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 4;
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      if (stageConfig) {
        const totalFrames = calcStageTotalFrames(stageConfig, W);
        const exactPct = state.score >= stageConfig.goalScore
          ? 100
          : Math.min(99, Math.floor((state.frameCount / totalFrames) * 100));
        // HUD는 10% 단위로 표시
        const hudPct = exactPct >= 100 ? 100 : Math.floor(exactPct / 10) * 10;
        const hudText = `${hudPct}%`;
        ctx.strokeText(hudText, W / 2, 50);
        ctx.fillText(hudText, W / 2, 50);
      } else {
        ctx.strokeText(state.score.toString(), W / 2, 50);
        ctx.fillText(state.score.toString(), W / 2, 50);
      }
      ctx.restore();

      // wraith 카운트다운
      if (state.isWraith && state.wraithTimeLeft > 0) {
        ctx.save();
        ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          `\u{1F47B} ${state.wraithTimeLeft}s`,
          W / 2,
          105
        );
        ctx.restore();
      }

      // Ready 화면
      if (state.status === "ready") {
        state.bird.y =
          state.canvasHeight * 0.4 + Math.sin(Date.now() / 300) * 10;

        // 스테이지 번호 표시
        if (stageConfig) {
          ctx.save();
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 3;
          ctx.font = "bold 22px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const stageLabel = `Stage ${stageConfig.id} - ${stageConfig.name}`;
          ctx.strokeText(stageLabel, W / 2, H * 0.54);
          ctx.fillText(stageLabel, W / 2, H * 0.54);
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 3;
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tapText = "Tap to Start";
        ctx.strokeText(tapText, W / 2, H * 0.62);
        ctx.fillText(tapText, W / 2, H * 0.62);
        ctx.restore();
      }

      // 다음 프레임
      if (state.status !== "gameover" && state.status !== "clear") {
        animFrameRef.current = requestAnimationFrame(() => gameLoop(ctx));
      }
    },
    [
      currentSeason,
      spawnPipe,
      spawnItem,
      applyBreak,
      applyWraith,
      applyPoint,
      checkAABB,
      stageConfig,
    ]
  );

  // ==================== Canvas 초기화 ====================

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    let hs = 0;
    const saved = localStorage.getItem("flappy_high_score");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) hs = parsed;
    }
    setHighScore(hs);

    gameRef.current = createInitialState(W, H, birdRarity, hs);
    setGameStatus("ready");
    setScore(0);
    setCoinReward(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => gameLoop(ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birdRarity, gameLoop]);

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
    } else if (state.status === "playing") {
      state.bird.velocity = GAME_CONFIG.jumpForce;
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
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onClick={gameStatus !== "gameover" && gameStatus !== "clear" ? handleTap : undefined}
        onTouchStart={
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 py-5">
              <h2 className="text-white text-2xl font-bold text-center">
                Game Over
              </h2>
            </div>

            {/* 점수 */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">
                  {stageConfig ? "Progress" : "Score"}
                </p>
                <p className="text-5xl font-bold text-gray-800">
                  {stageConfig ? `${progress}%` : score}
                </p>
              </div>

              {!stageConfig && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Best</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {highScore}
                  </p>
                </div>
              )}

              {coinReward > 0 && (
                <div className="text-center bg-yellow-50 rounded-xl py-2 px-4">
                  <p className="text-yellow-700 font-bold text-sm">
                    +{coinReward} Coins
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={stageConfig ? () => router.push("/stage-select") : handleGoHome}
                  className="flex-1 py-3.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {stageConfig ? (
                    <><List className="w-5 h-5" />Stages</>
                  ) : (
                    <><Home className="w-5 h-5" />Home</>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 스테이지 클리어 모달 */}
      {gameStatus === "clear" && stageConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 py-5">
              <h2 className="text-white text-2xl font-bold text-center">
                Stage Clear!
              </h2>
            </div>

            {/* 점수 */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">
                  Stage {stageConfig.id} - {stageConfig.name}
                </p>
                <p className="text-5xl font-bold text-gray-800">100%</p>
              </div>

              {coinReward > 0 && (
                <div className="text-center bg-yellow-50 rounded-xl py-2 px-4">
                  <p className="text-yellow-700 font-bold text-sm">
                    +{coinReward} Coins
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => router.push("/stage-select")}
                  className="flex-1 py-3.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <List className="w-5 h-5" />
                  Stages
                </button>
                <button
                  onClick={() => router.push(`/stage/${stageConfig.id + 1}`)}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
