/**
 * 새(캐릭터) 데이터 및 매핑
 *
 * TODO: 추후 데이터베이스 테이블로 마이그레이션 예정
 * - birds 테이블: 새 정보 (id, name, rarity, price, etc.)
 * - user_birds 테이블: 사용자별 보유 새 (user_id, bird_id, equipped, etc.)
 */

import { Bird, BirdRarity } from "@/types/bird";

/**
 * 전체 새 목록
 * ID 규칙: bird_{rarity}_{number}
 */
export const BIRDS: Bird[] = [
  // ========== COMMON 등급 (10마리) ==========
  {
    id: "bird_common_1",
    name: "Flappy",
    nameKo: "플래피",
    rarity: "common",
    description: "The original Flappy Bird! Everyone starts with this cheerful yellow bird.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
    isDefault: true, // 모든 유저가 기본 보유
  },
  {
    id: "bird_common_2",
    name: "Sparrow",
    nameKo: "참새",
    rarity: "common",
    description: "A friendly little sparrow that loves to hop around.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_3",
    name: "Bluebird",
    nameKo: "파랑새",
    rarity: "common",
    description: "A bright blue bird that brings happiness.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_4",
    name: "Robin",
    nameKo: "울새",
    rarity: "common",
    description: "A cheerful robin with a red breast.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_5",
    name: "Finch",
    nameKo: "되새",
    rarity: "common",
    description: "A small finch with beautiful patterns.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_6",
    name: "Wren",
    nameKo: "굴뚝새",
    rarity: "common",
    description: "A tiny but mighty wren.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_7",
    name: "Chickadee",
    nameKo: "박새",
    rarity: "common",
    description: "A playful chickadee that chirps happily.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_8",
    name: "Canary",
    nameKo: "카나리아",
    rarity: "common",
    description: "A golden canary with a beautiful song.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_9",
    name: "Parakeet",
    nameKo: "잉꼬",
    rarity: "common",
    description: "A colorful little parakeet.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
  {
    id: "bird_common_10",
    name: "Lovebird",
    nameKo: "모란앵무",
    rarity: "common",
    description: "A sweet lovebird looking for a friend.",
    imagePath: "/images/birds/common/image.png",
    price: 100,
  },
];

/**
 * ID로 새 찾기
 */
export function getBirdById(id: string): Bird | undefined {
  return BIRDS.find((bird) => bird.id === id);
}

/**
 * 등급별 새 목록 조회
 */
export function getBirdsByRarity(rarity: BirdRarity): Bird[] {
  return BIRDS.filter((bird) => bird.rarity === rarity);
}

/**
 * 기본 새 조회 (모든 유저가 보유)
 */
export function getDefaultBird(): Bird {
  const defaultBird = BIRDS.find((bird) => bird.isDefault);
  if (!defaultBird) {
    throw new Error("Default bird not found!");
  }
  return defaultBird;
}

/**
 * 전체 새 개수
 */
export function getTotalBirdCount(): number {
  return BIRDS.length;
}

/**
 * 등급별 새 개수
 */
export function getBirdCountByRarity(): Record<BirdRarity, number> {
  return {
    common: getBirdsByRarity("common").length,
    rare: getBirdsByRarity("rare").length,
    epic: getBirdsByRarity("epic").length,
    unique: getBirdsByRarity("unique").length,
  };
}

/**
 * 신규 유저 기본 보유 새 목록
 * (가입 시 자동으로 지급되는 새)
 */
export function getStarterBirds(): Bird[] {
  return BIRDS.filter((bird) => bird.isDefault);
}
