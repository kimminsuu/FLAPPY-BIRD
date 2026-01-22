/**
 * 새(캐릭터) 관련 타입 정의
 */

// 새 등급 배열 (런타임 순회 및 타입 추론용)
export const BIRD_RARITIES = ["common", "rare", "epic", "unique"] as const;

// 새 등급 (희귀도 순: UNIQUE > EPIC > RARE > COMMON)
export type BirdRarity = (typeof BIRD_RARITIES)[number];

// 등급별 메타 정보 인터페이스
export interface BirdRarityMeta {
  readonly label: string;
  readonly labelKo: string;
  readonly color: string;
  readonly bgColor: string;
  readonly order: number; // 높을수록 희귀
  readonly probability: number; // 뽑기 확률 (%)
}

// 새 등급별 정보 (Single Source of Truth)
export const BIRD_RARITY_INFO: Readonly<Record<BirdRarity, BirdRarityMeta>> = {
  common: {
    label: "Common",
    labelKo: "일반",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    order: 1,
    probability: 70,
  },
  rare: {
    label: "Rare",
    labelKo: "레어",
    color: "#3B82F6",
    bgColor: "#DBEAFE",
    order: 2,
    probability: 20,
  },
  epic: {
    label: "Epic",
    labelKo: "에픽",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    order: 3,
    probability: 7,
  },
  unique: {
    label: "Unique",
    labelKo: "유니크",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    order: 4,
    probability: 3,
  },
} as const;

// 뽑기 시스템 설정 (확률은 BIRD_RARITY_INFO에서 참조)
export const GACHA_CONFIG = {
  cost: 100, // 1회 뽑기 비용 (코인)
  duplicateRefund: 50, // 중복 시 환급 코인
} as const;

// 새 데이터 인터페이스
export interface Bird {
  readonly id: string; // 고유 ID (예: bird_common_1)
  readonly name: string; // 새 이름
  readonly nameKo: string; // 새 이름 (한글)
  readonly rarity: BirdRarity; // 등급
  readonly description: string; // 설명
  readonly imagePath: string; // 이미지 경로 ("svg" 또는 파일 경로)
  readonly isDefault?: boolean; // 기본 새 여부
}

// 사용자가 보유한 새 정보
export interface UserBird {
  readonly userId: string; // 사용자 ID
  readonly birdId: string; // 새 ID
  readonly acquiredAt: Date; // 획득 일시
  readonly isEquipped: boolean; // 현재 장착 여부
}

// 뽑기 결과
export interface GachaResult {
  readonly bird: Bird;
  readonly isNew: boolean; // 새로 획득한 새인지
  readonly refundCoins: number; // 환급 코인 (중복 시 25, 신규 시 0)
}

// 유틸리티: 유효한 등급인지 확인
export function isValidRarity(value: string): value is BirdRarity {
  return BIRD_RARITIES.includes(value as BirdRarity);
}
