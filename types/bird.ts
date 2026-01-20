/**
 * 새(캐릭터) 관련 타입 정의
 */

// 새 등급 (희귀도 순: UNIQUE > EPIC > RARE > COMMON)
export type BirdRarity = "common" | "rare" | "epic" | "unique";

// 새 등급별 정보
export const BIRD_RARITY_INFO: Record<
  BirdRarity,
  {
    label: string;
    labelKo: string;
    color: string;
    bgColor: string;
    order: number; // 높을수록 희귀
  }
> = {
  common: {
    label: "Common",
    labelKo: "일반",
    color: "#6B7280", // gray
    bgColor: "#F3F4F6",
    order: 1,
  },
  rare: {
    label: "Rare",
    labelKo: "레어",
    color: "#3B82F6", // blue
    bgColor: "#DBEAFE",
    order: 2,
  },
  epic: {
    label: "Epic",
    labelKo: "에픽",
    color: "#8B5CF6", // purple
    bgColor: "#EDE9FE",
    order: 3,
  },
  unique: {
    label: "Unique",
    labelKo: "유니크",
    color: "#F59E0B", // amber/gold
    bgColor: "#FEF3C7",
    order: 4,
  },
};

// 새 데이터 인터페이스
export interface Bird {
  id: string; // 고유 ID (예: bird_common_1)
  name: string; // 새 이름
  nameKo: string; // 새 이름 (한글)
  rarity: BirdRarity; // 등급
  description?: string; // 설명
  imagePath: string; // 이미지 경로
  price?: number; // 가격 (코인)
  isDefault?: boolean; // 기본 새 여부
}

// 사용자가 보유한 새 정보
export interface UserBird {
  odUsingbirdId: string; // 사용자 ID
  birdId: string; // 새 ID
  acquiredAt: Date; // 획득 일시
  isEquipped: boolean; // 현재 장착 여부
}
