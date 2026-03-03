/**
 * 사운드 유틸리티 (Web Audio API + HTML Audio)
 * - AudioContext 싱글턴 관리 (모바일 자동재생 정책 대응)
 * - playClickSound(): 버튼 클릭 "뾱" 효과음
 * - playJumpSound(): 점프 "뽀잉~" 효과음
 * - playGameOverSound(): 게임오버 효과음
 * - playCoinSound(): 코인(포인트) 아이템 "띠롱~" 효과음
 * - playWraithSound(): 유령 아이템 효과음
 * - playBreakSound(): 파괴 아이템 "파사삭" 효과음
 * - playEquipSound(): 장착 "착~" 효과음
 * - playGachaResultSound(rarity): 등급별 가챠 결과 효과음
 * BGM (HTML Audio):
 * - startBGM(): BGM 시작 (첫 사용자 인터랙션 후 호출)
 * - pauseBGM(): BGM 일시정지 (게임 진입 시)
 * - resumeBGM(): BGM 재개 (게임 퇴장 시)
 */

import type { BirdRarity } from "@/types/bird";

// ─── BGM (HTML Audio) ─────────────────────────────────────────────────────────

const BGM_SRC = "/sounds/푸른 들판 점프.mp3";
const BGM_VOLUME = 0.4;

let bgmAudio: HTMLAudioElement | null = null;
let bgmStarted = false;

function getBGMAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_SRC);
    bgmAudio.loop = true;
    bgmAudio.volume = BGM_VOLUME;
  }
  return bgmAudio;
}

/** BGM 시작 (첫 사용자 인터랙션 이후 호출) */
export function startBGM(): void {
  const audio = getBGMAudio();
  if (!audio || bgmStarted) return;
  bgmStarted = true;
  audio.play().catch(() => {});
}

/** BGM 일시정지 (게임 진입 시) */
export function pauseBGM(): void {
  bgmAudio?.pause();
}

/** BGM 재시작 (게임 퇴장 시 — 처음부터 다시 재생) */
export function resumeBGM(): void {
  if (!bgmStarted) return;
  const audio = getBGMAudio();
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ─── 효과음 (Web Audio API) ───────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

/** AudioContext 싱글턴 반환 (모바일: suspended 상태면 resume) */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

/** 간단한 톤 하나 재생하는 헬퍼 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  freqEnd?: number
): void {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * 버튼 클릭 효과음
 * - 짧은 사인파 (~80ms), 600→200Hz 하강 = "뾱"
 */
export function playClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 600, ctx.currentTime, 0.08, 0.15, "sine", 200);
}

/**
 * 점프 효과음 "뽀잉~"
 * - 사인파 저음→고음 빠르게 상승 (스프링 바운스 느낌)
 * - 약간의 삼각파 레이어로 통통한 질감
 */
export function playJumpSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 메인: 사인파 280→580Hz 빠르게 상승 (뽀잉 핵심)
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(580, now + 0.07);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.10, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);

  // 서브 레이어: 삼각파로 통통한 질감
  const sub = ctx.createOscillator();
  sub.type = "triangle";
  sub.frequency.setValueAtTime(350, now);
  sub.frequency.exponentialRampToValueAtTime(700, now + 0.06);
  sub.frequency.exponentialRampToValueAtTime(500, now + 0.1);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.04, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.1);
}

/**
 * 게임오버 효과음
 * - 하강 음계 (삐용~↓) + 저음 충돌감
 */
export function playGameOverSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 메인: 하강 사인파 (삐용~↓)
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);

  // 저음 충돌 "퍽" (짧은 노이즈 + 저음)
  const sub = ctx.createOscillator();
  sub.type = "square";
  sub.frequency.setValueAtTime(90, now);
  sub.frequency.exponentialRampToValueAtTime(40, now + 0.15);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.08, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.15);
}

/**
 * 코인(포인트) 아이템 효과음 "띠롱~"
 * - 밝은 2음 상승 (동전 먹는 클래식 사운드)
 */
export function playCoinSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 첫 음: B5
  playTone(ctx, 988, now, 0.08, 0.12, "sine");
  // 두번째 음: E6 (밝게 상승)
  playTone(ctx, 1319, now + 0.07, 0.18, 0.14, "sine");
  // 살짝 하모닉
  playTone(ctx, 2637, now + 0.07, 0.12, 0.04, "sine");
}

/**
 * 유령 아이템 효과음
 * - 으스스한 하강 후 울리는 느낌
 */
export function playWraithSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 으스스한 상승→하강 사인파
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.10, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);

  // 저음 울림 레이어
  playTone(ctx, 180, now, 0.25, 0.06, "triangle", 120);
}

/**
 * 파괴 아이템 효과음 (유리/얼음 깨지는 느낌)
 * - 고주파 노이즈 버스트 (유리 산산조각)
 * - 높은 사인파 파편음 여러 개
 */
export function playBreakSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1) 고주파 노이즈 — 유리 깨지는 "챠르륵"
  const bufferSize = Math.floor(ctx.sampleRate * 0.25);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const hpFilter = ctx.createBiquadFilter();
  hpFilter.type = "highpass";
  hpFilter.frequency.setValueAtTime(4000, now);
  hpFilter.Q.value = 0.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.14, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  noise.connect(hpFilter);
  hpFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // 2) 파편 튕기는 높은 사인파들 (쨍쨍)
  playTone(ctx, 3200, now, 0.06, 0.08, "sine", 1800);
  playTone(ctx, 4500, now + 0.03, 0.05, 0.06, "sine", 2500);
  playTone(ctx, 2800, now + 0.07, 0.07, 0.05, "sine", 1500);
  playTone(ctx, 5000, now + 0.1, 0.04, 0.04, "sine", 3000);

  // 3) 임팩트 순간 짧은 저음 (균열감)
  playTone(ctx, 200, now, 0.05, 0.07, "triangle", 80);
}

/**
 * 장착 효과음 "착~"
 * - 짧고 선명한 2연타: 높은음 → 더 높은음 (착! 느낌)
 */
export function playEquipSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 800, now, 0.06, 0.13, "sine", 600);
  playTone(ctx, 1200, now + 0.06, 0.1, 0.15, "sine", 900);
}

/**
 * 등급별 가챠 결과 효과음
 * - common: 짧은 단음 "띵"
 * - rare: 2음 상승 "띵띵~"
 * - epic: 3음 화려한 상승 코드
 * - unique: 4음 팡파레 + 잔향
 */
export function playGachaResultSound(rarity: BirdRarity): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  switch (rarity) {
    case "common":
      // 단순한 "띵" (C5)
      playTone(ctx, 523, now, 0.2, 0.12, "sine");
      break;

    case "rare":
      // 2음 상승 "띵띵~" (C5 → E5)
      playTone(ctx, 523, now, 0.15, 0.12, "sine");
      playTone(ctx, 659, now + 0.12, 0.25, 0.14, "sine");
      break;

    case "epic":
      // 3음 화려한 상승 (C5 → E5 → G5) + 삼각파로 풍성함
      playTone(ctx, 523, now, 0.12, 0.10, "sine");
      playTone(ctx, 659, now + 0.1, 0.12, 0.12, "sine");
      playTone(ctx, 784, now + 0.2, 0.35, 0.15, "triangle");
      // 하모닉 레이어
      playTone(ctx, 1047, now + 0.2, 0.3, 0.06, "sine");
      break;

    case "unique":
      // 4음 팡파레 (C5 → E5 → G5 → C6) + 풍성한 코드 + 잔향
      playTone(ctx, 523, now, 0.1, 0.10, "sine");
      playTone(ctx, 659, now + 0.08, 0.1, 0.12, "sine");
      playTone(ctx, 784, now + 0.16, 0.1, 0.13, "triangle");
      playTone(ctx, 1047, now + 0.24, 0.5, 0.16, "sine");
      // 코드 화음 (C major 배음)
      playTone(ctx, 659, now + 0.24, 0.45, 0.08, "sine");   // E5
      playTone(ctx, 784, now + 0.24, 0.45, 0.07, "sine");   // G5
      // 옥타브 위 반짝임
      playTone(ctx, 2093, now + 0.3, 0.3, 0.04, "sine");    // C7 살짝
      break;
  }
}
