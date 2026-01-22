/**
 * 새(캐릭터) 데이터 및 뽑기 시스템
 *
 * TODO: 추후 데이터베이스 테이블로 마이그레이션 예정
 * - birds 테이블: 새 정보 (id, name, rarity, etc.)
 * - user_birds 테이블: 사용자별 보유 새 (user_id, bird_id, equipped, etc.)
 */

import {
  Bird,
  BirdRarity,
  BIRD_RARITIES,
  BIRD_RARITY_INFO,
  GACHA_CONFIG,
  GachaResult,
} from "@/types/bird";

// ==================== 유틸리티 ====================

/**
 * 배열에서 랜덤 요소 선택
 */
function getRandomElement<T>(array: readonly T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot get random element from empty array");
  }
  return array[Math.floor(Math.random() * array.length)];
}

// ==================== 새 데이터 ====================

/**
 * 전체 새 목록 (불변)
 * ID 규칙: bird_{rarity}_{number}
 */
export const BIRDS: readonly Bird[] = [
  // ========== COMMON 등급 (10마리) ==========
  {
    id: "bird_common_1",
    name: "Flappy",
    nameKo: "플래피",
    rarity: "common",
    description: "The original Flappy Bird! Everyone starts with this cheerful yellow bird.",
    imagePath: "svg", // FlappyBird SVG 컴포넌트 사용
    isDefault: true,
  },
  {
    id: "bird_common_2",
    name: "Blue",
    nameKo: "파랑이",
    rarity: "common",
    description: "A cheerful blue bird soaring through the sky.",
    imagePath: "/images/birds/common/bird_common_2.png",
  },
  {
    id: "bird_common_3",
    name: "Pink",
    nameKo: "분홍이",
    rarity: "common",
    description: "A lovely pink bird with a sweet personality.",
    imagePath: "/images/birds/common/bird_common_3.png",
  },
  {
    id: "bird_common_4",
    name: "Red",
    nameKo: "빨강이",
    rarity: "common",
    description: "A bold red bird full of energy.",
    imagePath: "/images/birds/common/bird_common_4.png",
  },
  {
    id: "bird_common_5",
    name: "Orange",
    nameKo: "주황이",
    rarity: "common",
    description: "A bright orange bird that shines like the sun.",
    imagePath: "/images/birds/common/bird_common_5.png",
  },
  {
    id: "bird_common_6",
    name: "Green",
    nameKo: "초록이",
    rarity: "common",
    description: "A fresh green bird from the forest.",
    imagePath: "/images/birds/common/bird_common_6.png",
  },
  {
    id: "bird_common_7",
    name: "Purple",
    nameKo: "보라",
    rarity: "common",
    description: "A mysterious purple bird with elegance.",
    imagePath: "/images/birds/common/bird_common_7.png",
  },
  {
    id: "bird_common_8",
    name: "Cyan",
    nameKo: "청록이",
    rarity: "common",
    description: "A cool cyan bird from the ocean breeze.",
    imagePath: "/images/birds/common/bird_common_8.png",
  },
  {
    id: "bird_common_9",
    name: "Brown",
    nameKo: "갈색이",
    rarity: "common",
    description: "A cozy brown bird with warm feathers.",
    imagePath: "/images/birds/common/bird_common_9.png",
  },
  {
    id: "bird_common_10",
    name: "Gray",
    nameKo: "회색이",
    rarity: "common",
    description: "A calm gray bird with a gentle spirit.",
    imagePath: "/images/birds/common/bird_common_10.png",
  },

  // ========== EPIC 등급 (9마리) ==========
  {
    id: "bird_epic_1",
    name: "Puppy",
    nameKo: "강아지",
    rarity: "epic",
    description: "A cute and loyal puppy with floppy ears.",
    imagePath: "/images/birds/epic/bird_epic_1.png",
  },
  {
    id: "bird_epic_2",
    name: "Cat",
    nameKo: "고양이",
    rarity: "epic",
    description: "A curious gray cat with big round eyes.",
    imagePath: "/images/birds/epic/bird_epic_2.png",
  },
  {
    id: "bird_epic_3",
    name: "Hamster",
    nameKo: "햄스터",
    rarity: "epic",
    description: "A chubby golden hamster with adorable cheeks.",
    imagePath: "/images/birds/epic/bird_epic_3.png",
  },
  {
    id: "bird_epic_4",
    name: "Squirrel",
    nameKo: "다람쥐",
    rarity: "epic",
    description: "A fluffy squirrel with a bushy tail.",
    imagePath: "/images/birds/epic/bird_epic_4.png",
  },
  {
    id: "bird_epic_5",
    name: "Fox",
    nameKo: "여우",
    rarity: "epic",
    description: "A clever orange fox with a fluffy tail.",
    imagePath: "/images/birds/epic/bird_epic_5.png",
  },
  {
    id: "bird_epic_6",
    name: "Bear",
    nameKo: "곰",
    rarity: "epic",
    description: "A friendly brown bear with a gentle face.",
    imagePath: "/images/birds/epic/bird_epic_6.png",
  },
  {
    id: "bird_epic_7",
    name: "Monkey",
    nameKo: "원숭이",
    rarity: "epic",
    description: "A playful monkey with a curly tail.",
    imagePath: "/images/birds/epic/bird_epic_7.png",
  },
  {
    id: "bird_epic_8",
    name: "Dragon",
    nameKo: "드래곤",
    rarity: "epic",
    description: "A cute green dragon with tiny wings.",
    imagePath: "/images/birds/epic/bird_epic_8.png",
  },
  {
    id: "bird_epic_9",
    name: "Snake",
    nameKo: "뱀",
    rarity: "epic",
    description: "A friendly green snake with big eyes.",
    imagePath: "/images/birds/epic/bird_epic_9.png",
  },
] as const;

// ==================== 조회 함수 ====================

/**
 * ID로 새 찾기
 */
export function getBirdById(id: string): Bird | undefined {
  return BIRDS.find((bird) => bird.id === id);
}

/**
 * 등급별 새 목록 조회
 */
export function getBirdsByRarity(rarity: BirdRarity): readonly Bird[] {
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
 * 등급별 새 개수 (단일 순회로 최적화)
 */
export function getBirdCountByRarity(): Record<BirdRarity, number> {
  const counts: Record<BirdRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    unique: 0,
  };

  for (const bird of BIRDS) {
    counts[bird.rarity]++;
  }

  return counts;
}

/**
 * 신규 유저 기본 보유 새 목록
 */
export function getStarterBirds(): readonly Bird[] {
  return BIRDS.filter((bird) => bird.isDefault);
}

// ==================== 뽑기(가챠) 시스템 ====================

/**
 * 뽑기 비용 조회
 */
export function getGachaCost(): number {
  return GACHA_CONFIG.cost;
}

/**
 * 확률에 따라 등급 결정 (BIRD_RARITY_INFO를 Single Source of Truth로 사용)
 */
export function rollRarity(): BirdRarity {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const rarity of BIRD_RARITIES) {
    cumulative += BIRD_RARITY_INFO[rarity].probability;
    if (random < cumulative) {
      return rarity;
    }
  }

  // 부동소수점 오차 대비 fallback
  return "common";
}

/**
 * 뽑기 실행 - GachaResult 반환
 * @param ownedBirdIds 이미 보유한 새 ID 목록
 * @returns 뽑기 결과 (새 + 신규 여부 + 환급 코인)
 */
export function performGacha(ownedBirdIds: readonly string[] = []): GachaResult {
  const rarity = rollRarity();
  const birdsOfRarity = getBirdsByRarity(rarity);

  let selectedBird: Bird;

  if (birdsOfRarity.length === 0) {
    // 해당 등급 새가 없으면 common으로 대체
    const commonBirds = getBirdsByRarity("common");
    if (commonBirds.length === 0) {
      throw new Error("No birds available for gacha!");
    }
    selectedBird = getRandomElement(commonBirds);
  } else {
    selectedBird = getRandomElement(birdsOfRarity);
  }

  const isNew = !ownedBirdIds.includes(selectedBird.id);

  return {
    bird: selectedBird,
    isNew,
    refundCoins: isNew ? 0 : GACHA_CONFIG.duplicateRefund,
  };
}

/**
 * 뽑기 가능 여부 확인
 */
export function canPerformGacha(userCoins: number): boolean {
  return userCoins >= GACHA_CONFIG.cost;
}

/**
 * 중복 시 환급 코인 조회
 */
export function getDuplicateRefund(): number {
  return GACHA_CONFIG.duplicateRefund;
}

/**
 * 등급별 확률 조회 (UI 표시용)
 */
export function getGachaProbabilities(): Record<BirdRarity, number> {
  return BIRD_RARITIES.reduce(
    (acc, rarity) => ({
      ...acc,
      [rarity]: BIRD_RARITY_INFO[rarity].probability,
    }),
    {} as Record<BirdRarity, number>
  );
}
