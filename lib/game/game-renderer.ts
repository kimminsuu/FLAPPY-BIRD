/**
 * 게임 캔버스 렌더링
 * - buildGradientCache(): 계절별 그라디언트 캐시 빌드
 * - renderFrame(): 전체 프레임 렌더링 (배경, 중력존, 파이프, 스피드링, 포탈, 파티클, 잔디, 아이템, 새, 플래시, HUD, Ready 화면)
 */

import { GAME_CONFIG, PIPE_COLORS } from "@/types/game";
import type { StageConfig } from "@/types/stage";
import type { GameStateRef, GradientCache } from "./game-types";
import { calcStageTotalScrollDist } from "./game-types";

// ==================== 그라디언트 캐시 빌드 ====================

export function buildGradientCache(
  ctx: CanvasRenderingContext2D,
  H: number,
  season: string,
  cache: GradientCache
): void {
  if (cache.season === season && cache.canvasHeight === H && cache.skyGrad) return;
  cache.season = season;
  cache.canvasHeight = H;

  const playableH = H - GAME_CONFIG.groundHeight;
  const colors = PIPE_COLORS[season] || PIPE_COLORS.summer;

  // 하늘
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  switch (season) {
    case "spring":
      sky.addColorStop(0, "#87CEEB"); sky.addColorStop(0.5, "#B0E0E6"); sky.addColorStop(1, "#98D8C8"); break;
    case "summer":
      sky.addColorStop(0, "#4EC0CA"); sky.addColorStop(0.5, "#71C5CF"); sky.addColorStop(1, "#87CEEB"); break;
    case "autumn":
      sky.addColorStop(0, "#F4A460"); sky.addColorStop(0.5, "#DEB887"); sky.addColorStop(1, "#D2B48C"); break;
    case "winter":
      sky.addColorStop(0, "#B0C4DE"); sky.addColorStop(0.5, "#87CEEB"); sky.addColorStop(1, "#E0FFFF"); break;
  }
  cache.skyGrad = sky;

  // 잔디
  const grass = ctx.createLinearGradient(0, playableH, 0, H);
  switch (season) {
    case "spring":
      grass.addColorStop(0, "#8BC34A"); grass.addColorStop(0.2, "#7CB342"); grass.addColorStop(1, "#558B2F"); break;
    case "summer":
      grass.addColorStop(0, "#7CB342"); grass.addColorStop(0.2, "#5B8C3E"); grass.addColorStop(1, "#4A7A2E"); break;
    case "autumn":
      grass.addColorStop(0, "#D2691E"); grass.addColorStop(0.2, "#CD853F"); grass.addColorStop(1, "#8B4513"); break;
    case "winter":
      grass.addColorStop(0, "#FFFAFA"); grass.addColorStop(0.2, "#F0F8FF"); grass.addColorStop(1, "#E8E8E8"); break;
  }
  cache.grassGrad = grass;

  // 파이프 body
  const pw = GAME_CONFIG.pipeWidth;
  const body = ctx.createLinearGradient(0, 0, pw, 0);
  body.addColorStop(0, colors.highlight);
  body.addColorStop(0.15, colors.body);
  body.addColorStop(0.5, colors.body);
  body.addColorStop(0.85, colors.highlight);
  body.addColorStop(1, colors.highlight);
  cache.pipeBodyGrad = body;

  // 파이프 cap
  const capW = pw + 8;
  const cap = ctx.createLinearGradient(0, 0, capW, 0);
  cap.addColorStop(0, colors.capEdge);
  cap.addColorStop(0.15, colors.highlight);
  cap.addColorStop(0.5, colors.highlight);
  cap.addColorStop(0.85, colors.highlight);
  cap.addColorStop(1, colors.capEdge);
  cache.pipeCapGrad = cap;
}

// ==================== 렌더링 옵션 ====================

export interface RenderOptions {
  season: string;
  stageConfig?: StageConfig;
  birdImage: HTMLImageElement | null;
  birdAspect: number;
  cache: GradientCache;
}

// ==================== 프레임 렌더링 ====================

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  opts: RenderOptions
): void {
  const { canvasWidth: W, canvasHeight: H } = state;
  const playableHeight = H - GAME_CONFIG.groundHeight;
  const birdW = GAME_CONFIG.birdWidth;
  const birdH = birdW * opts.birdAspect;
  const cache = opts.cache;

  // 그라디언트 캐시 갱신
  buildGradientCache(ctx, H, opts.season, cache);

  // 하늘 배경
  ctx.fillStyle = cache.skyGrad!;
  ctx.fillRect(0, 0, W, H);

  // 중력 반전 존 오버레이
  renderGravityZones(ctx, state, W, playableHeight);

  // 파이프
  renderPipes(ctx, state, playableHeight, cache);

  // 스피드 링
  renderSpeedRings(ctx, state);

  // 포탈
  renderPortals(ctx, state, W);

  // 포탈 파티클 생성
  if (state.status === "playing") {
    spawnPortalParticles(state, W);
  }

  // 파티클
  renderParticles(ctx, state);

  // 잔디
  ctx.fillStyle = cache.grassGrad!;
  ctx.fillRect(0, playableHeight, W, GAME_CONFIG.groundHeight);

  // 아이템
  renderItems(ctx, state);

  // 새
  renderBird(ctx, state, birdW, birdH, opts.birdImage);

  // 화면 플래시
  renderScreenFlash(ctx, state, W, H);

  // 플로팅 텍스트
  renderFloatingTexts(ctx, state);

  // HUD
  renderHUD(ctx, state, W, opts.stageConfig);

  // Ready 화면
  if (state.status === "ready") {
    renderReadyScreen(ctx, state, W, H, opts.stageConfig);
  }
}

// ==================== 개별 렌더 함수 ====================

function renderGravityZones(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  W: number,
  playableHeight: number
): void {
  for (const zone of state.gravityZones) {
    if (zone.startX > W || zone.endX < 0) continue;

    ctx.save();
    ctx.fillStyle = "rgba(100, 50, 180, 0.12)";
    const drawStartX = Math.max(0, zone.startX);
    const drawEndX = Math.min(W, zone.endX);
    ctx.fillRect(drawStartX, 0, drawEndX - drawStartX, playableHeight);

    ctx.strokeStyle = "rgba(120, 60, 200, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    if (zone.startX > -10 && zone.startX < W + 10) {
      ctx.beginPath();
      ctx.moveTo(zone.startX, 0);
      ctx.lineTo(zone.startX, playableHeight);
      ctx.stroke();
    }
    if (zone.endX > -10 && zone.endX < W + 10) {
      ctx.beginPath();
      ctx.moveTo(zone.endX, 0);
      ctx.lineTo(zone.endX, playableHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(120, 60, 200, 0.6)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (zone.startX > 0 && zone.startX < W) {
      ctx.fillText("\u2195", zone.startX + 14, playableHeight * 0.15);
      ctx.fillText("\u2195", zone.startX + 14, playableHeight * 0.85);
    }
    if (zone.endX > 0 && zone.endX < W) {
      ctx.fillText("\u2195", zone.endX - 14, playableHeight * 0.15);
      ctx.fillText("\u2195", zone.endX - 14, playableHeight * 0.85);
    }

    if (zone.startX + 8 > 0 && zone.startX + 8 < W) {
      ctx.fillStyle = "rgba(120, 60, 200, 0.45)";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("REVERSE", zone.startX + 8, 10);
    }

    ctx.restore();
  }
}

function renderPipes(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  playableHeight: number,
  cache: GradientCache
): void {
  const capH = 20;
  const capOverhang = 4;

  const drawPipeBody = (x: number, y: number, w: number, h: number) => {
    if (h <= 0) return;
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillStyle = cache.pipeBodyGrad!;
    ctx.fillRect(0, y, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(3, y, 4, h);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(8, y, 2, h);

    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(w - 6, y, 4, h);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(w - 10, y, 2, h);

    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    ctx.lineWidth = 1;
    const segmentHeight = 20;
    const startSeg = Math.ceil(y / segmentHeight) * segmentHeight;
    for (let sy = startSeg; sy < y + h; sy += segmentHeight) {
      ctx.beginPath();
      ctx.moveTo(2, sy);
      ctx.lineTo(w - 2, sy);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, y, w - 1, h);
    ctx.restore();
  };

  const drawPipeCap = (x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillStyle = cache.pipeCapGrad!;

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(r, y);
    ctx.lineTo(w - r, y);
    ctx.arcTo(w, y, w, y + r, r);
    ctx.lineTo(w, y + h - r);
    ctx.arcTo(w, y + h, w - r, y + h, r);
    ctx.lineTo(r, y + h);
    ctx.arcTo(0, y + h, 0, y + h - r, r);
    ctx.lineTo(0, y + r);
    ctx.arcTo(0, y, r, y, r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(3, y + 2, w - 6, 4);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(3, y + h - 5, w - 6, 3);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(2, y + 4, 5, h - 8);

    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r, y);
    ctx.lineTo(w - r, y);
    ctx.arcTo(w, y, w, y + r, r);
    ctx.lineTo(w, y + h - r);
    ctx.arcTo(w, y + h, w - r, y + h, r);
    ctx.lineTo(r, y + h);
    ctx.arcTo(0, y + h, 0, y + h - r, r);
    ctx.lineTo(0, y + r);
    ctx.arcTo(0, y, r, y, r);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  for (const pipe of state.pipes) {
    const topH = pipe.gapY - pipe.gapHeight / 2;
    const bottomY = pipe.gapY + pipe.gapHeight / 2;
    const bottomH = playableHeight - bottomY;
    const pw = pipe.width;
    const px = pipe.x;

    if (pipe.gapHeight < capH * 2) {
      const midY = pipe.gapY;
      const halfCap = capH / 2;
      drawPipeBody(px, 0, pw, midY - halfCap);
      drawPipeCap(px - capOverhang, midY - halfCap, pw + capOverhang * 2, capH);
      drawPipeBody(px, midY + halfCap, pw, playableHeight - midY - halfCap);
    } else {
      drawPipeBody(px, 0, pw, topH - capH);
      drawPipeCap(px - capOverhang, topH - capH, pw + capOverhang * 2, capH);
      drawPipeCap(px - capOverhang, bottomY, pw + capOverhang * 2, capH);
      drawPipeBody(px, bottomY + capH, pw, bottomH - capH);
    }
  }
}

function renderSpeedRings(ctx: CanvasRenderingContext2D, state: GameStateRef): void {
  for (const pipe of state.pipes) {
    if (!pipe.speedRing || pipe.passed) continue;
    ctx.save();
    const ringX = pipe.x + pipe.width / 2;
    const ringY = pipe.gapY;
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.08;
    const rW = 10 * pulse;
    const rH = 26 * pulse;
    const thickness = 5;
    const innerRW = rW - thickness * 0.5;
    const innerRH = rH - thickness;

    ctx.translate(ringX, ringY);

    ctx.fillStyle = pipe.speedRing === "slow"
      ? "rgba(74, 222, 128, 0.12)"
      : "rgba(239, 68, 68, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rW * 1.3, rH * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = pipe.speedRing === "slow" ? "#4ADE80" : "#EF4444";
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, -rH * 0.1, rW * 0.85, rH * 0.7, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.ellipse(0, -rH * 0.1, innerRW * 0.85, innerRH * 0.7, 0, Math.PI * 1.9, Math.PI * 1.1, true);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = pipe.speedRing === "slow"
      ? "rgba(22, 163, 74, 0.5)"
      : "rgba(185, 28, 28, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
    ctx.stroke();

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
}

function renderPortals(ctx: CanvasRenderingContext2D, state: GameStateRef, W: number): void {
  const now = Date.now();
  for (const portal of state.portals) {
    if (portal.activated && portal.type === "in") continue;
    if (portal.x < -60 || portal.x > W + 60) continue;
    ctx.save();
    const pulse = 1 + Math.sin(now / 180) * 0.1;
    const rW = portal.size * 0.7 * pulse;
    const rH = portal.size * 0.35 * pulse;
    const thickness = 10;
    const innerRW = rW - thickness;
    const innerRH = rH - thickness * 0.5;
    ctx.translate(portal.x, portal.y);

    const tilt = Math.sin(now / 400) * 0.15;
    ctx.rotate(tilt);

    ctx.fillStyle = "rgba(251, 191, 36, 0.1)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rW * 1.2, rH * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "#FBBF24";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -rH * 0.1, rW * 0.85, rH * 0.75, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.ellipse(0, -rH * 0.1, innerRW * 0.85, innerRH * 0.75, 0, Math.PI * 1.9, Math.PI * 1.1, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fill();

    ctx.strokeStyle = "rgba(180, 120, 0, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rW, rH, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, innerRW, innerRH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 소용돌이 라인
    const isIn = portal.type === "in";
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 2; s++) {
      const baseAngle = (now / 300) * (isIn ? 1 : -1) + (Math.PI * 2 * s) / 2;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.15) {
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

    // IN/OUT 라벨
    ctx.rotate(-tilt);
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
}

function spawnPortalParticles(state: GameStateRef, W: number): void {
  for (const portal of state.portals) {
    if (portal.activated && portal.type === "in") continue;
    if (portal.x < -60 || portal.x > W + 60) continue;
    if (Math.random() > 0.15) continue;
    if (state.particles.length >= GAME_CONFIG.maxParticles) continue;
    const isIn = portal.type === "in";
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 25;
    const px = portal.x + Math.cos(angle) * dist * (isIn ? 1 : 0.3);
    const py = portal.y + Math.sin(angle) * dist * 0.5 * (isIn ? 1 : 0.3);
    const speed = 0.8 + Math.random() * 1.2;
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

function renderParticles(ctx: CanvasRenderingContext2D, state: GameStateRef): void {
  for (const p of state.particles) {
    if (p.type === "circle") {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 0.1);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function renderItems(ctx: CanvasRenderingContext2D, state: GameStateRef): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const item of state.items) {
    if (item.collected) continue;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
    const emojiFont = `${item.size * 0.55}px sans-serif`;

    switch (item.type) {
      case "break":
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = emojiFont;
        ctx.fillText("\u{1F4A5}", item.x, item.y);
        break;
      case "wraith":
        ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = emojiFont;
        ctx.fillText("\u{1F47B}", item.x, item.y);
        break;
      case "point":
        ctx.fillStyle = "rgba(234, 179, 8, 0.9)";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = emojiFont;
        ctx.fillText("\u2B50", item.x, item.y);
        break;
    }
  }
}

function renderBird(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  birdW: number,
  birdH: number,
  birdImage: HTMLImageElement | null
): void {
  if (state.isTeleporting) return;

  ctx.save();
  const birdCX = state.bird.x + birdW / 2;
  const birdCY = state.bird.y + birdH / 2;
  ctx.translate(birdCX, birdCY);
  ctx.rotate((state.bird.rotation * Math.PI) / 180);
  if (state.isGravityReversed) {
    ctx.scale(1, -1);
  }

  if (state.isWraith) {
    ctx.globalAlpha = 0.4;
  }

  if (birdImage) {
    ctx.drawImage(birdImage, -birdW / 2, -birdH / 2, birdW, birdH);
  } else {
    ctx.fillStyle = "#F9D71C";
    ctx.beginPath();
    ctx.ellipse(0, 0, birdW / 2, birdH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderScreenFlash(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  W: number,
  H: number
): void {
  if (!state.screenFlash) return;
  ctx.globalAlpha = state.screenFlash.alpha;
  ctx.fillStyle = state.screenFlash.color;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: GameStateRef): void {
  if (state.floatingTexts.length === 0) return;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const ft of state.floatingTexts) {
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${ft.fontSize}px sans-serif`;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}

function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  W: number,
  stageConfig?: StageConfig
): void {
  const birdW = GAME_CONFIG.birdWidth;
  const birdH = birdW * (state.bird.y > 0 ? 1 : 1); // aspect handled externally

  ctx.save();
  ctx.textAlign = "center";

  // 점수 HUD
  ctx.fillStyle = "white";
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 4;
  ctx.font = "bold 28px sans-serif";
  ctx.textBaseline = "top";
  if (stageConfig) {
    const totalDist = calcStageTotalScrollDist(stageConfig, W);
    const exactPct = state.score >= stageConfig.goalScore
      ? 100
      : Math.min(99, Math.floor((state.scrollDistance / totalDist) * 100));
    const hudPct = exactPct >= 100 ? 100 : Math.floor(exactPct / 10) * 10;
    const hudText = `${hudPct}%`;
    ctx.strokeText(hudText, W / 2, 16);
    ctx.fillText(hudText, W / 2, 16);
    // [DEBUG] 1% 단위 수치
    ctx.font = "bold 14px sans-serif";
    ctx.lineWidth = 2;
    ctx.strokeText(`${exactPct}%`, W / 2 + 60, 22);
    ctx.fillText(`${exactPct}%`, W / 2 + 60, 22);
  } else {
    ctx.strokeText(state.score.toString(), W / 2, 16);
    ctx.fillText(state.score.toString(), W / 2, 16);
  }

  // wraith 카운트다운
  if (state.isWraith && state.wraithTimeLeft > 0) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
    ctx.font = "bold 18px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(`\u{1F47B} ${state.wraithTimeLeft}s`, W / 2, 48);
  }

  // 스피드 링 상태 HUD
  if (state.speedState && state.speedTimeLeft > 0) {
    const hudX = state.bird.x - 8;
    const hudY = state.bird.y - 22;
    const emoji = state.speedState === "slow" ? "\u{1F422}" : "\u26A1";
    const color = state.speedState === "slow"
      ? "rgba(34, 197, 94, 0.9)"
      : "rgba(239, 68, 68, 0.9)";
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.font = "bold 13px sans-serif";
    ctx.textBaseline = "bottom";
    ctx.strokeText(`${emoji} ${state.speedTimeLeft}s`, hudX, hudY);
    ctx.fillText(`${emoji} ${state.speedTimeLeft}s`, hudX, hudY);
  }
  ctx.restore();
}

function renderReadyScreen(
  ctx: CanvasRenderingContext2D,
  state: GameStateRef,
  W: number,
  H: number,
  stageConfig?: StageConfig
): void {
  state.bird.y = state.canvasHeight * 0.4 + Math.sin(Date.now() / 300) * 10;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 3;

  if (stageConfig) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 16px sans-serif";
    const stageLabel = `Stage ${stageConfig.id} - ${stageConfig.name}`;
    ctx.strokeText(stageLabel, W / 2, H * 0.52);
    ctx.fillText(stageLabel, W / 2, H * 0.52);
  }

  ctx.fillStyle = "white";
  ctx.font = "bold 20px sans-serif";
  const tapText = "Tap to Start";
  ctx.strokeText(tapText, W / 2, H * 0.62);
  ctx.fillText(tapText, W / 2, H * 0.62);
  ctx.restore();
}
