/**
 * FlappyBird 앱 아이콘 생성 스크립트
 * - bird_common_1 (Flappy) SVG + 하늘색 배경
 * - sharp로 PNG 변환 후 Android mipmap 폴더에 저장
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const resDir = join(projectRoot, "android", "app", "src", "main", "res");

// FlappyBird SVG (bird_common_1) - 하늘색 배경에 새
function createIconSvg(size, isRound = false) {
  const clip = isRound
    ? `<clipPath id="round"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></clipPath>`
    : "";
  const clipAttr = isRound ? 'clip-path="url(#round)"' : "";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${clip}</defs>
  <g ${clipAttr}>
    <!-- 하늘색 배경 -->
    <rect width="${size}" height="${size}" fill="#87CEEB" />
    <!-- FlappyBird (centered, scaled to 70% of icon) -->
    <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${(size * 0.7) / 100})">
      <!-- 몸통 -->
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#F9D71C" />
      <ellipse cx="50" cy="60" rx="30" ry="22" fill="#F5AB35" />
      <!-- 배 -->
      <ellipse cx="55" cy="62" rx="18" ry="16" fill="#FFF8DC" />
      <!-- 눈 -->
      <circle cx="62" cy="42" r="14" fill="white" />
      <circle cx="62" cy="42" r="12" stroke="#333" stroke-width="2" fill="white" />
      <!-- 눈동자 -->
      <circle cx="65" cy="42" r="6" fill="#333" />
      <circle cx="67" cy="40" r="2" fill="white" />
      <!-- 부리 -->
      <path d="M 75 52 L 95 55 L 75 62 Z" fill="#E84A3C" />
      <path d="M 75 52 L 95 55 L 75 56 Z" fill="#F39C12" />
      <!-- 날개 -->
      <ellipse cx="30" cy="55" rx="15" ry="10" fill="#E8B923" />
      <ellipse cx="28" cy="55" rx="10" ry="6" fill="#D4A017" />
      <!-- 꼬리 -->
      <path d="M 15 50 Q 5 45 10 55 Q 5 65 15 60 Z" fill="#E8B923" />
    </g>
  </g>
</svg>`;
}

// Adaptive icon foreground SVG (108dp viewport, bird in 72dp safe zone)
function createForegroundSvg(size) {
  // 108dp total, 72dp safe zone centered (offset 18dp from each edge)
  // Scale: bird 100x100 viewport fits in 72dp → scale = 72/100 * (size/108)
  const scale = (size * 0.667) / 100; // 72/108 ≈ 0.667
  const offset = size * 0.167; // 18/108 ≈ 0.167

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- 몸통 -->
    <ellipse cx="50" cy="55" rx="35" ry="30" fill="#F9D71C" />
    <ellipse cx="50" cy="60" rx="30" ry="22" fill="#F5AB35" />
    <!-- 배 -->
    <ellipse cx="55" cy="62" rx="18" ry="16" fill="#FFF8DC" />
    <!-- 눈 -->
    <circle cx="62" cy="42" r="14" fill="white" />
    <circle cx="62" cy="42" r="12" stroke="#333" stroke-width="2" fill="white" />
    <!-- 눈동자 -->
    <circle cx="65" cy="42" r="6" fill="#333" />
    <circle cx="67" cy="40" r="2" fill="white" />
    <!-- 부리 -->
    <path d="M 75 52 L 95 55 L 75 62 Z" fill="#E84A3C" />
    <path d="M 75 52 L 95 55 L 75 56 Z" fill="#F39C12" />
    <!-- 날개 -->
    <ellipse cx="30" cy="55" rx="15" ry="10" fill="#E8B923" />
    <ellipse cx="28" cy="55" rx="10" ry="6" fill="#D4A017" />
    <!-- 꼬리 -->
    <path d="M 15 50 Q 5 45 10 55 Q 5 65 15 60 Z" fill="#E8B923" />
  </g>
</svg>`;
}

// Mipmap density → pixel sizes
const densities = [
  { name: "mdpi", launcher: 48, foreground: 108 },
  { name: "hdpi", launcher: 72, foreground: 162 },
  { name: "xhdpi", launcher: 96, foreground: 216 },
  { name: "xxhdpi", launcher: 144, foreground: 324 },
  { name: "xxxhdpi", launcher: 192, foreground: 432 },
];

async function generateIcons() {
  for (const d of densities) {
    const dir = join(resDir, `mipmap-${d.name}`);

    // ic_launcher.png (square with slight round corners handled by system)
    const launcherSvg = createIconSvg(d.launcher, false);
    await sharp(Buffer.from(launcherSvg)).png().toFile(join(dir, "ic_launcher.png"));
    console.log(`  ${d.name}/ic_launcher.png (${d.launcher}x${d.launcher})`);

    // ic_launcher_round.png (circular)
    const roundSvg = createIconSvg(d.launcher, true);
    await sharp(Buffer.from(roundSvg)).png().toFile(join(dir, "ic_launcher_round.png"));
    console.log(`  ${d.name}/ic_launcher_round.png (${d.launcher}x${d.launcher})`);

    // ic_launcher_foreground.png (adaptive icon foreground)
    const fgSvg = createForegroundSvg(d.foreground);
    await sharp(Buffer.from(fgSvg)).png().toFile(join(dir, "ic_launcher_foreground.png"));
    console.log(`  ${d.name}/ic_launcher_foreground.png (${d.foreground}x${d.foreground})`);
  }

  console.log("\nAll icons generated!");
}

generateIcons().catch(console.error);
