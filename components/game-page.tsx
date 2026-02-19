"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Home, RotateCcw, ChevronRight, List } from "lucide-react";
import { useSeason } from "@/lib/season-context";
import { getBirdById } from "@/lib/birds";
import { useUser } from "@/lib/user-context";
import {
  addCoins,
  updateHighScore,
  updateStageBest,
  getHighScore as fetchHighScore,
  getEquippedBirdId,
} from "@/lib/user-service";
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
  type TeleportPortal,
  type GravityZone,
} from "@/types/game";
import type { StageConfig } from "@/types/stage";

// ==================== 스테이지 총 프레임 계산 ====================

/**
 * 마지막 파이프가 새를 통과하는 시점까지의 총 스크롤 거리(px)를 계산.
 * - spacing × pipeSpeed = 파이프 간 픽셀 거리 (속도 변해도 일정)
 * - 마지막 파이프 이동 거리: (W+10+pipeWidth) - (W*0.25)
 */
function calcStageTotalScrollDist(cfg: StageConfig, canvasWidth: number): number {
  // 마지막 파이프 스폰까지의 누적 스크롤 거리
  let lastSpawnDist = cfg.pipeSpeed; // 파이프 0: 즉시 스폰 (1프레임 분)
  for (let i = 1; i < cfg.pipes.length; i++) {
    lastSpawnDist += (cfg.pipes[i].spacing ?? cfg.pipeSpacing) * cfg.pipeSpeed;
  }
  // 마지막 파이프가 새 위치를 지나는 데 필요한 거리
  const travelDist = canvasWidth * 0.75 + 10 + GAME_CONFIG.pipeWidth;
  return lastSpawnDist + travelDist;
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
  nextPipeFrame: number; // 스테이지 모드: 다음 파이프 스폰 프레임 (레코드 모드 호환)
  scrollDistance: number; // 스테이지 모드: 누적 스크롤 거리 (px)
  nextPipeScrollDist: number; // 스테이지 모드: 다음 파이프 스폰 거리 (px)
  portals: TeleportPortal[];
  isTeleporting: boolean;
  teleportOutPortal: TeleportPortal | null;
  teleportPipe: Pipe | null; // 텔레포트 중인 파이프 직접 참조
  nextPipeId: number; // 파이프 고유 ID 카운터
  nextTeleportPairId: number; // 포탈 페어 ID 카운터
  isGravityReversed: boolean; // 현재 중력 반전 상태
  gravityZones: GravityZone[]; // 반전 존 목록 (렌더링용)
  playStartTime: number; // 플레이 시작 시각 (Date.now())
  speedState: "slow" | "fast" | null; // 현재 스피드 상태
  speedEndTime: number; // 효과 종료 시각 (Date.now 기준)
  speedTimeLeft: number; // UI 표시용 (초 단위)
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
    scrollDistance: 0,
    nextPipeScrollDist: 0,
    portals: [],
    isTeleporting: false,
    teleportOutPortal: null,
    teleportPipe: null,
    nextPipeId: 0,
    nextTeleportPairId: 0,
    isGravityReversed: false,
    gravityZones: [],
    playStartTime: 0,
    speedState: null,
    speedEndTime: 0,
    speedTimeLeft: 0,
  };
}

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
  const birdAspectRef = useRef<number>(1); // height / width 비율
  const userIdRef = useRef<string>(""); // 게임 루프 내에서 사용
  const patchUserRef = useRef(patchUser);
  patchUserRef.current = patchUser;
  const userCoinsRef = useRef(0);

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
    fetchHighScore(user.id).then((hs) => setHighScore(hs));
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
      id: state.nextPipeId++,
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

        // 글로벌 스피드 배수 (유튜브 배속처럼 게임 전체에 적용)
        const speedMul = state.speedState === "fast"
          ? GAME_CONFIG.speedRingFastMultiplier
          : state.speedState === "slow"
            ? 1 / GAME_CONFIG.speedRingSlowDivisor
            : 1;

        // 새 물리 (텔레포트 중 스킵)
        if (!state.isTeleporting) {
          const grav = state.isGravityReversed ? -GAME_CONFIG.gravity : GAME_CONFIG.gravity;
          state.bird.velocity += grav * speedMul;
          state.bird.y += state.bird.velocity * speedMul;

          if (state.isGravityReversed) {
            // 반전 시: rotation 방향도 반전
            state.bird.rotation = Math.min(
              30,
              Math.max(-90, -state.bird.velocity * 3)
            );

            // 반전 시 천장 충돌 = gameover (바닥처럼)
            if (!state.isWraith && state.bird.y < 0) {
              state.status = "gameover";
            }
            if (state.bird.y < 0) {
              state.bird.y = 0;
              state.bird.velocity = 0;
            }

            // 반전 시 바닥 = 제한 (천장처럼)
            if (state.bird.y + birdH > playableHeight) {
              state.bird.y = playableHeight - birdH;
              state.bird.velocity = 0;
            }
          } else {
            // 정상 중력
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
          }
        }

        // 파이프 속도 계산 (스피드 링 배수 포함)
        const basePipeSpeed = stageConfig
          ? stageConfig.pipeSpeed
          : GAME_CONFIG.pipeSpeed;
        const currentPipeSpeed = basePipeSpeed * speedMul;

        // 파이프 생성
        if (stageConfig) {
          // 누적 스크롤 거리 업데이트 (speedMul 반영 → 속도 변해도 파이프 간격 일정)
          state.scrollDistance += currentPipeSpeed;

          // STAGE 모드: 거리 기반 스폰 (속도 변해도 파이프 간 화면 거리 동일)
          if (
            state.nextPipeIndex < stageConfig.pipes.length &&
            state.scrollDistance >= state.nextPipeScrollDist
          ) {
            const pipeDef = stageConfig.pipes[state.nextPipeIndex];
            const playH = state.canvasHeight - GAME_CONFIG.groundHeight;
            const margin = pipeDef.gapHeight / 2 + 40;
            const gapY = margin + pipeDef.gapY * (playH - margin * 2);
            const pipeX = state.canvasWidth + 10;
            const pipeId = state.nextPipeId++;
            state.pipes.push({
              id: pipeId,
              x: pipeX,
              gapY,
              gapHeight: pipeDef.gapHeight,
              passed: false,
              width: GAME_CONFIG.pipeWidth,
              isTeleportPipe: !!pipeDef.teleport,
              originalGapHeight: pipeDef.teleport ? pipeDef.gapHeight : undefined,
              speedRing: pipeDef.speedRing,
            });

            // 중력 반전 존 생성 (true 파이프 스폰 시 양쪽 경계를 즉시 확정)
            if (pipeDef.reverseGravity === true && stageConfig) {
              const curIdx = state.nextPipeIndex;
              // startX = 이전 파이프와 이 파이프 사이 중간점
              const startSpacing = pipeDef.spacing ?? stageConfig.pipeSpacing;
              const startGapPx = startSpacing * stageConfig.pipeSpeed - GAME_CONFIG.pipeWidth;
              const startX = pipeX - startGapPx / 2;

              // false 파이프를 미리 찾아서 endX도 즉시 계산
              let totalSpacingFrames = 0;
              let foundFalse = false;
              let endGapPx = 0;
              for (let fi = curIdx + 1; fi < stageConfig.pipes.length; fi++) {
                const futureDef = stageConfig.pipes[fi];
                totalSpacingFrames += futureDef.spacing ?? stageConfig.pipeSpacing;
                if (futureDef.reverseGravity === false) {
                  const endSpacing = futureDef.spacing ?? stageConfig.pipeSpacing;
                  endGapPx = endSpacing * stageConfig.pipeSpeed - GAME_CONFIG.pipeWidth;
                  foundFalse = true;
                  break;
                }
              }
              let endX: number;
              if (foundFalse) {
                endX = pipeX - endGapPx / 2 + totalSpacingFrames * stageConfig.pipeSpeed;
              } else {
                // 존이 스테이지 끝까지 이어지는 경우: 마지막 파이프 너머까지 확장
                endX = pipeX + totalSpacingFrames * stageConfig.pipeSpeed + GAME_CONFIG.pipeWidth + 200;
              }

              state.gravityZones.push({ startX, endX });
            }

            // 텔레포트 포탈 생성
            if (pipeDef.teleport) {
              const pairId = state.nextTeleportPairId++;
              const portalSize = 50;
              const inYPos = pipeDef.teleport.inY * playH;
              const outYPos = pipeDef.teleport.outY * playH;
              state.portals.push({
                x: pipeX - 100,
                y: inYPos,
                type: "in",
                activated: false,
                size: portalSize,
                pairId,
                pipeId,
              });
              state.portals.push({
                x: pipeX + GAME_CONFIG.pipeWidth + 100,
                y: outYPos,
                type: "out",
                activated: false,
                size: portalSize,
                pairId,
                pipeId,
              });
            }

            state.nextPipeIndex++;
            // 다음 파이프 스폰 거리 계산 (spacing × basePipeSpeed = 픽셀 거리)
            if (state.nextPipeIndex < stageConfig.pipes.length) {
              const nextDef = stageConfig.pipes[state.nextPipeIndex];
              const spacingFrames = nextDef.spacing ?? stageConfig.pipeSpacing;
              state.nextPipeScrollDist =
                state.scrollDistance + spacingFrames * stageConfig.pipeSpeed;
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
        for (let i = state.pipes.length - 1; i >= 0; i--) {
          const pipe = state.pipes[i];
          pipe.x -= currentPipeSpeed;

          if (!pipe.passed && pipe.x + pipe.width < state.bird.x) {
            pipe.passed = true;
            state.score++;

            // 스피드 링 효과 적용
            if (pipe.speedRing) {
              state.speedState = pipe.speedRing;
              state.speedEndTime = Date.now() + GAME_CONFIG.speedRingDuration * 1000;
              state.speedTimeLeft = GAME_CONFIG.speedRingDuration;

              // 이펙트
              const bCX = state.bird.x + birdW / 2;
              const bCY = state.bird.y + birdH / 2;
              const color1 = pipe.speedRing === "slow" ? "#86EFAC" : "#FCA5A5";
              const color2 = pipe.speedRing === "slow" ? "#4ADE80" : "#EF4444";
              for (let k = 0; k < 14; k++) {
                const angle = (Math.PI * 2 * k) / 14;
                const speed = 1.5 + Math.random() * 2.5;
                state.particles.push({
                  x: bCX,
                  y: bCY,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 3 + Math.random() * 4,
                  color: Math.random() > 0.5 ? color1 : color2,
                  alpha: 1,
                  life: 25 + Math.random() * 15,
                  maxLife: 40,
                  type: "circle",
                });
              }
              state.screenFlash = {
                color: pipe.speedRing === "slow"
                  ? "rgba(74, 222, 128, 0.3)"
                  : "rgba(239, 68, 68, 0.3)",
                alpha: 1,
                life: 12,
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
          const item = state.items[i];
          item.x -= currentPipeSpeed;

          if (item.x + item.size < -10) {
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
            // 존이 화면 밖으로 완전히 나가면 제거
            if (zone.endX < -100) {
              state.gravityZones.splice(i, 1);
              continue;
            }
            // 새가 존 내부인지 체크
            if (birdCenterX >= zone.startX && birdCenterX <= zone.endX) {
              nowReversed = true;
            }
          }
          // 상태 변화 감지 → 진입/해제 이펙트
          if (nowReversed !== state.isGravityReversed) {
            state.isGravityReversed = nowReversed;
            // 경계 통과 시 y속도 초기화 (급격한 가속 방지)
            state.bird.velocity = 0;
            // 보라색 플래시
            state.screenFlash = {
              color: nowReversed ? "rgba(100, 50, 180, 0.35)" : "rgba(100, 50, 180, 0.25)",
              alpha: 1,
              life: 12,
            };
            // 보라색 파티클
            const bCX = state.bird.x + birdW / 2;
            const bCY = state.bird.y + birdH / 2;
            for (let k = 0; k < 14; k++) {
              const angle = (Math.PI * 2 * k) / 14;
              const speed = 1.5 + Math.random() * 2.5;
              state.particles.push({
                x: bCX,
                y: bCY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: Math.random() > 0.5 ? "#7C3AED" : "#A78BFA",
                alpha: 1,
                life: 25 + Math.random() * 15,
                maxLife: 40,
                type: "circle",
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
              // 텔레포트 활성화
              state.isTeleporting = true;
              portal.activated = true;
              // OUT 포탈 찾기 (고유 pairId로 매칭)
              const outPortal = state.portals.find(
                (p) => p.type === "out" && p.pairId === portal.pairId
              );
              state.teleportOutPortal = outPortal || null;
              // 파이프 직접 참조 (splice 후에도 안전)
              state.teleportPipe = state.pipes.find((p) => p.id === portal.pipeId) || null;

              // IN 이펙트 파티클 (노란색 / 금색, 중심으로 수렴)
              for (let k = 0; k < 16; k++) {
                const angle = (Math.PI * 2 * k) / 16;
                const dist = 30 + Math.random() * 20;
                state.particles.push({
                  x: portal.x + Math.cos(angle) * dist,
                  y: portal.y + Math.sin(angle) * dist * 0.5,
                  vx: -Math.cos(angle) * (1.5 + Math.random()),
                  vy: -Math.sin(angle) * (1 + Math.random()) * 0.5,
                  size: 3 + Math.random() * 4,
                  color: Math.random() > 0.5 ? "#FBBF24" : "#FDE047",
                  alpha: 1,
                  life: 20 + Math.random() * 10,
                  maxLife: 30,
                  type: "circle",
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
            // 재등장
            state.isTeleporting = false;
            state.bird.y = out.y - birdH / 2;
            state.bird.velocity = 0;
            state.bird.rotation = 0;
            out.activated = true;
            state.teleportOutPortal = null;

            // 막힌 파이프 자동 통과 처리 (직접 참조)
            if (state.teleportPipe && !state.teleportPipe.passed) {
              state.teleportPipe.passed = true;
              state.score++;
            }
            state.teleportPipe = null;

            // OUT 이펙트 파티클 (노란색 / 금색, 방사)
            const bCX = state.bird.x + birdW / 2;
            const bCY = state.bird.y + birdH / 2;
            for (let k = 0; k < 20; k++) {
              const angle = (Math.PI * 2 * k) / 20;
              const speed = 2 + Math.random() * 3;
              state.particles.push({
                x: bCX,
                y: bCY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 5,
                color: Math.random() > 0.4 ? "#FBBF24" : "#FDE047",
                alpha: 1,
                life: 30 + Math.random() * 15,
                maxLife: 45,
                type: "circle",
              });
            }
            state.screenFlash = { color: "rgba(251, 191, 36, 0.3)", alpha: 1, life: 12 };
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

        // 파이프 충돌 감지 (텔레포트 중 스킵)
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

        // 스피드 링 타이머 (실제 시간 기반)
        if (state.speedState) {
          const msLeft = state.speedEndTime - Date.now();
          if (msLeft <= 0) {
            state.speedState = null;
            state.speedTimeLeft = 0;
          } else {
            state.speedTimeLeft = Math.ceil(msLeft / 1000);
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
          if (userIdRef.current) updateStageBest(userIdRef.current, stageConfig.id, 100);
          setCoinReward(0);
          setScore(state.score);
          setGameStatus("clear");
          return;
        }

        // 게임오버 처리
        if (state.status === "gameover") {
          if (stageConfig) {
            // 스테이지 모드: 스크롤 거리 기반 진행률
            const totalDist = calcStageTotalScrollDist(stageConfig, state.canvasWidth);
            const finalPct = Math.min(99, Math.floor((state.scrollDistance / totalDist) * 100));
            setProgress(finalPct);
            if (userIdRef.current) updateStageBest(userIdRef.current, stageConfig.id, finalPct);
          } else {
            // RECORD 모드: 최고점수 저장
            if (state.score > state.highScore) {
              state.highScore = state.score;
              if (userIdRef.current) updateHighScore(userIdRef.current, state.score);
            }
          }
          const reward = stageConfig
            ? 0
            : state.score * GAME_CONFIG.coinRewardMultiplier;
          if (reward > 0 && userIdRef.current) {
            addCoins(userIdRef.current, reward);
            const newCoins = userCoinsRef.current + reward;
            userCoinsRef.current = newCoins;
            patchUserRef.current({ coins: newCoins });
          }
          if (state.score > state.highScore) {
            patchUserRef.current({ high_score: state.score });
          }
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

      // 중력 반전 존 오버레이
      for (const zone of state.gravityZones) {
        const zStartX = zone.startX;
        const zEndX = zone.endX;
        const zoneWidth = zEndX - zStartX;
        if (zStartX > W || zEndX < 0) continue; // 화면 밖이면 스킵

        // 보라색 반투명 오버레이
        ctx.save();
        ctx.fillStyle = "rgba(100, 50, 180, 0.12)";
        const drawStartX = Math.max(0, zStartX);
        const drawEndX = Math.min(W, zEndX);
        ctx.fillRect(drawStartX, 0, drawEndX - drawStartX, playableHeight);

        // 경계선: 세로 점선 (보라색)
        ctx.strokeStyle = "rgba(120, 60, 200, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        // 시작 경계선
        if (zStartX > -10 && zStartX < W + 10) {
          ctx.beginPath();
          ctx.moveTo(zStartX, 0);
          ctx.lineTo(zStartX, playableHeight);
          ctx.stroke();
        }
        // 끝 경계선
        if (zEndX > -10 && zEndX < W + 10) {
          ctx.beginPath();
          ctx.moveTo(zEndX, 0);
          ctx.lineTo(zEndX, playableHeight);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // 경계선 옆 화살표 ↕
        ctx.fillStyle = "rgba(120, 60, 200, 0.6)";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (zStartX > 0 && zStartX < W) {
          ctx.fillText("\u2195", zStartX + 14, playableHeight * 0.15);
          ctx.fillText("\u2195", zStartX + 14, playableHeight * 0.85);
        }
        if (zEndX > 0 && zEndX < W) {
          ctx.fillText("\u2195", zEndX - 14, playableHeight * 0.15);
          ctx.fillText("\u2195", zEndX - 14, playableHeight * 0.85);
        }

        // in 경계선 오른쪽 위 가장자리에 "REVERSE" 텍스트
        if (zStartX + 8 > 0 && zStartX + 8 < W) {
          ctx.fillStyle = "rgba(120, 60, 200, 0.45)";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText("REVERSE", zStartX + 8, 10);
        }

        ctx.restore();
      }

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

        if (pipe.gapHeight < capH * 2) {
          // 갭이 캡 2개보다 작으면 → 막힌 파이프 스타일
          // 닫히는 중간이면 캡 위치를 gapY 기준으로 배치
          const midY = pipe.gapY;
          const halfCap = capH / 2;
          drawPipeBody(px, 0, pw, midY - halfCap);
          drawPipeCap(px - capOverhang, midY - halfCap, pw + capOverhang * 2, capH);
          drawPipeBody(px, midY + halfCap, pw, playableHeight - midY - halfCap);
        } else {
          // 상단 파이프
          drawPipeBody(px, 0, pw, topH - capH);
          drawPipeCap(px - capOverhang, topH - capH, pw + capOverhang * 2, capH);

          // 하단 파이프
          drawPipeCap(px - capOverhang, bottomY, pw + capOverhang * 2, capH);
          drawPipeBody(px, bottomY + capH, pw, bottomH - capH);
        }
      }

      // 스피드 링 렌더링 (파이프 갭 중앙, 세로로 긴 타원)
      for (const pipe of state.pipes) {
        if (!pipe.speedRing || pipe.passed) continue;
        ctx.save();
        const ringX = pipe.x + pipe.width / 2;
        const ringY = pipe.gapY;
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.08;
        const rW = 14 * pulse;  // 가로 좁게
        const rH = 36 * pulse;  // 세로 길게
        const thickness = 7;
        const innerRW = rW - thickness * 0.5;
        const innerRH = rH - thickness;

        ctx.translate(ringX, ringY);

        // 글로우
        const glowColor = pipe.speedRing === "slow"
          ? "rgba(74, 222, 128, 0.2)"
          : "rgba(239, 68, 68, 0.2)";
        const glowGrad = ctx.createRadialGradient(0, 0, rW * 0.3, 0, 0, rW * 1.3);
        glowGrad.addColorStop(0, glowColor);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rW * 1.3, rH * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 링 본체 (도넛)
        ctx.beginPath();
        ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2, true);
        ctx.closePath();
        if (pipe.speedRing === "slow") {
          const grad = ctx.createLinearGradient(-rW, -rH, rW, rH);
          grad.addColorStop(0, "#86EFAC");
          grad.addColorStop(0.5, "#4ADE80");
          grad.addColorStop(1, "#22C55E");
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createLinearGradient(-rW, -rH, rW, rH);
          grad.addColorStop(0, "#FCA5A5");
          grad.addColorStop(0.5, "#EF4444");
          grad.addColorStop(1, "#DC2626");
          ctx.fillStyle = grad;
        }
        ctx.fill();

        // 링 하이라이트
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.ellipse(0, -rH * 0.1, rW * 0.85, rH * 0.7, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.ellipse(0, -rH * 0.1, innerRW * 0.85, innerRH * 0.7, 0, Math.PI * 1.9, Math.PI * 1.1, true);
        ctx.closePath();
        ctx.fill();

        // 테두리
        ctx.strokeStyle = pipe.speedRing === "slow"
          ? "rgba(22, 163, 74, 0.5)"
          : "rgba(185, 28, 28, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
        ctx.stroke();

        // SLOW / FAST 라벨
        const label = pipe.speedRing === "slow" ? "SLOW" : "FAST";
        ctx.fillStyle = pipe.speedRing === "slow"
          ? "rgba(34, 197, 94, 0.9)"
          : "rgba(239, 68, 68, 0.9)";
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeText(label, 0, rH + 4);
        ctx.fillText(label, 0, rH + 4);

        ctx.restore();
      }

      // 포탈 렌더링
      const now = Date.now();
      for (const portal of state.portals) {
        if (portal.activated && portal.type === "in") continue;
        ctx.save();
        const pulse = 1 + Math.sin(now / 180) * 0.1;
        const rW = portal.size * 0.7 * pulse; // 링 외곽 반지름 (가로)
        const rH = portal.size * 0.35 * pulse; // 링 외곽 반지름 (세로)
        const thickness = 10; // 링 두께
        const innerRW = rW - thickness;
        const innerRH = rH - thickness * 0.5;
        ctx.translate(portal.x, portal.y);

        // 회전 애니메이션 (살짝 기울기 변화)
        const tilt = Math.sin(now / 400) * 0.15;
        ctx.rotate(tilt);

        // 외곽 글로우
        const glowGrad = ctx.createRadialGradient(0, 0, rW * 0.3, 0, 0, rW * 1.2);
        glowGrad.addColorStop(0, "rgba(251, 191, 36, 0)");
        glowGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.15)");
        glowGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rW * 1.2, rH * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 링 본체 (외곽 타원 - 내부 타원 = 도넛)
        ctx.beginPath();
        ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2, true);
        ctx.closePath();
        const ringGrad = ctx.createLinearGradient(-rW, -rH, rW, rH);
        ringGrad.addColorStop(0, "#FDE047"); // 밝은 노랑
        ringGrad.addColorStop(0.3, "#FBBF24"); // 금색
        ringGrad.addColorStop(0.6, "#F59E0B"); // 진한 금
        ringGrad.addColorStop(1, "#FDE047");
        ctx.fillStyle = ringGrad;
        ctx.fill();

        // 링 하이라이트 (상단 빛)
        ctx.beginPath();
        ctx.ellipse(0, -rH * 0.1, rW * 0.85, rH * 0.75, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.ellipse(0, -rH * 0.1, innerRW * 0.85, innerRH * 0.75, 0, Math.PI * 1.9, Math.PI * 1.1, true);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fill();

        // 링 테두리
        ctx.strokeStyle = "rgba(180, 120, 0, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 중앙 빨려들어가는/나오는 효과 (소용돌이 라인)
        const isIn = portal.type === "in";
        const spiralCount = 4;
        ctx.strokeStyle = isIn
          ? "rgba(251, 191, 36, 0.4)"
          : "rgba(251, 191, 36, 0.4)";
        ctx.lineWidth = 1.5;
        for (let s = 0; s < spiralCount; s++) {
          const baseAngle = (now / 300) * (isIn ? 1 : -1) + (Math.PI * 2 * s) / spiralCount;
          ctx.beginPath();
          for (let t = 0; t <= 1; t += 0.05) {
            const angle = baseAngle + t * Math.PI * 1.5 * (isIn ? 1 : -1);
            const r = isIn ? innerRW * 0.8 * (1 - t) : innerRW * 0.8 * t;
            const rY = isIn ? innerRH * 0.8 * (1 - t) : innerRH * 0.8 * t;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * rY;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }

        // IN/OUT 라벨 (링 아래)
        ctx.rotate(-tilt); // 회전 해제
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const label = portal.type === "in" ? "IN" : "OUT";
        ctx.strokeText(label, 0, rH + 4);
        ctx.fillText(label, 0, rH + 4);

        ctx.restore();
      }

      // 포탈 흡입/방출 파티클 생성 (매 프레임 조금씩)
      if (state.status === "playing") {
        for (const portal of state.portals) {
          if (portal.activated && portal.type === "in") continue;
          if (Math.random() > 0.3) continue; // ~30% 확률로 매 프레임 파티클
          const isIn = portal.type === "in";
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * 25;
          const px = portal.x + Math.cos(angle) * dist * (isIn ? 1 : 0.3);
          const py = portal.y + Math.sin(angle) * dist * 0.5 * (isIn ? 1 : 0.3);
          const speed = 0.8 + Math.random() * 1.2;
          // IN: 바깥에서 중심으로, OUT: 중심에서 바깥으로
          const dx = portal.x - px;
          const dy = portal.y - py;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          state.particles.push({
            x: isIn ? px : portal.x,
            y: isIn ? py : portal.y,
            vx: isIn ? (dx / len) * speed : -((dx / len) * speed),
            vy: isIn ? (dy / len) * speed : -((dy / len) * speed),
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? "#FBBF24" : "#FDE047",
            alpha: 0.8,
            life: 15 + Math.random() * 10,
            maxLife: 25,
            type: "circle",
          });
        }
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

      // 새 (텔레포트 중 숨김)
      if (!state.isTeleporting) {
        ctx.save();
        const birdCX = state.bird.x + birdW / 2;
        const birdCY = state.bird.y + birdH / 2;
        ctx.translate(birdCX, birdCY);
        ctx.rotate((state.bird.rotation * Math.PI) / 180);
        // 중력 반전 시 새 상하 뒤집기
        if (state.isGravityReversed) {
          ctx.scale(1, -1);
        }

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
      }


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
        const totalDist = calcStageTotalScrollDist(stageConfig, W);
        const exactPct = state.score >= stageConfig.goalScore
          ? 100
          : Math.min(99, Math.floor((state.scrollDistance / totalDist) * 100));
        // HUD는 10% 단위로 표시
        const hudPct = exactPct >= 100 ? 100 : Math.floor(exactPct / 10) * 10;
        const hudText = `${hudPct}%`;
        ctx.strokeText(hudText, W / 2, 50);
        ctx.fillText(hudText, W / 2, 50);
        // [DEBUG] 1% 단위 수치 (배포 시 제거)
        ctx.font = "bold 20px sans-serif";
        ctx.lineWidth = 2;
        ctx.strokeText(`${exactPct}%`, W / 2 + 80, 58);
        ctx.fillText(`${exactPct}%`, W / 2 + 80, 58);
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

      // 스피드 링 상태 HUD (새 왼쪽 위)
      if (state.speedState && state.speedTimeLeft > 0) {
        ctx.save();
        const hudX = state.bird.x - 10;
        const hudY = state.bird.y - 30;
        const emoji = state.speedState === "slow" ? "\u{1F422}" : "\u26A1";
        const color = state.speedState === "slow"
          ? "rgba(34, 197, 94, 0.9)"
          : "rgba(239, 68, 68, 0.9)";
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.strokeText(`${emoji} ${state.speedTimeLeft}s`, hudX, hudY);
        ctx.fillText(`${emoji} ${state.speedTimeLeft}s`, hudX, hudY);
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

    const hs = highScore;

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
      state.playStartTime = Date.now();
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
