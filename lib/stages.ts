/**
 * 스테이지 데이터 정의
 */

import type { StageConfig } from "@/types/stage";

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: "초원",
    pipeSpacing: 310,
    pipeSpeed: 2,
    goalScore: 15,
    enableItems: false,
    pipes: [
      { gapY: 0.45, gapHeight: 200 },
      { gapY: 0.50, gapHeight: 200 },
      { gapY: 0.42, gapHeight: 200 },
      { gapY: 0.55, gapHeight: 195 },
      { gapY: 0.38, gapHeight: 195 },
      { gapY: 0.50, gapHeight: 195 },
      { gapY: 0.46, gapHeight: 190 },
      { gapY: 0.58, gapHeight: 190 },
      { gapY: 0.40, gapHeight: 190 },
      { gapY: 0.52, gapHeight: 190 },
      { gapY: 0.35, gapHeight: 185 },
      { gapY: 0.48, gapHeight: 185 },
      { gapY: 0.55, gapHeight: 185 },
      { gapY: 0.42, gapHeight: 185 },
      { gapY: 0.50, gapHeight: 185 },
    ],
  },
  {
    id: 2,
    name: "숲길",
    pipeSpacing: 250,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 초반 (250~230, gap 160~157, y변화 소)
      { gapY: 0.45, gapHeight: 160 },
      { gapY: 0.50, gapHeight: 159, spacing: 246 },
      { gapY: 0.42, gapHeight: 158, spacing: 242 },
      { gapY: 0.52, gapHeight: 158, spacing: 238 },
      { gapY: 0.40, gapHeight: 157, spacing: 234 },
      // 중반 진입 (230~200, gap 156~150, y변화 중)
      { gapY: 0.58, gapHeight: 156, spacing: 230 },
      { gapY: 0.35, gapHeight: 155, spacing: 225 },
      { gapY: 0.60, gapHeight: 154, spacing: 220 },
      { gapY: 0.38, gapHeight: 153, spacing: 215 },
      { gapY: 0.55, gapHeight: 152, spacing: 210 },
      // 중반 (205~180, gap 150~146, y변화 대 ~1/4)
      { gapY: 0.28, gapHeight: 150, spacing: 205 },
      { gapY: 0.58, gapHeight: 150, spacing: 200 },  // △0.30
      { gapY: 0.32, gapHeight: 149, spacing: 195 },  // △0.26
      { gapY: 0.62, gapHeight: 148, spacing: 190 },  // △0.30
      { gapY: 0.38, gapHeight: 147, spacing: 185 },  // △0.24
      // 후반 (178~160, gap 146~142, y변화 대 ~1/3)
      { gapY: 0.70, gapHeight: 146, spacing: 178 },  // △0.32
      { gapY: 0.35, gapHeight: 145, spacing: 174 },  // △0.35
      { gapY: 0.68, gapHeight: 144, spacing: 170 },  // △0.33
      { gapY: 0.32, gapHeight: 144, spacing: 166 },  // △0.36
      { gapY: 0.65, gapHeight: 143, spacing: 162 },  // △0.33
      // 마무리 (158~150, gap 142~140, y변화 극대 ~1/3)
      { gapY: 0.30, gapHeight: 142, spacing: 158 },  // △0.35
      { gapY: 0.65, gapHeight: 141, spacing: 155 },   // △0.35
      { gapY: 0.33, gapHeight: 141, spacing: 153 },   // △0.32
      { gapY: 0.60, gapHeight: 140, spacing: 151 },   // △0.27
      { gapY: 0.45, gapHeight: 140, spacing: 150 },
    ],
  },
  {
    id: 3,
    name: "동굴",
    pipeSpacing: 240,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 초반 (spacing 240, gap 160~155)
      { gapY: 0.45, gapHeight: 160 },
      { gapY: 0.50, gapHeight: 158, spacing: 235 },
      { gapY: 0.40, gapHeight: 157, spacing: 230 },
      { gapY: 0.55, gapHeight: 156, spacing: 225 },
      // 5번: 첫 번째 텔레포트
      { gapY: 0.50, gapHeight: 155, spacing: 220, teleport: { inY: 0.70, outY: 0.25 } },
      { gapY: 0.42, gapHeight: 155, spacing: 215 },
      { gapY: 0.58, gapHeight: 154, spacing: 210 },
      { gapY: 0.35, gapHeight: 153, spacing: 205 },
      { gapY: 0.55, gapHeight: 152, spacing: 200 },
      { gapY: 0.40, gapHeight: 151, spacing: 195 },
      // 11번: 두 번째 텔레포트
      { gapY: 0.50, gapHeight: 150, spacing: 190, teleport: { inY: 0.30, outY: 0.72 } },
      { gapY: 0.60, gapHeight: 150, spacing: 185 },
      { gapY: 0.35, gapHeight: 149, spacing: 182 },
      { gapY: 0.62, gapHeight: 148, spacing: 178 },
      { gapY: 0.38, gapHeight: 148, spacing: 175 },
      { gapY: 0.55, gapHeight: 147, spacing: 172 },
      { gapY: 0.32, gapHeight: 147, spacing: 170 },
      // 18번: 세 번째 텔레포트
      { gapY: 0.50, gapHeight: 146, spacing: 168, teleport: { inY: 0.65, outY: 0.20 } },
      { gapY: 0.58, gapHeight: 146, spacing: 165 },
      { gapY: 0.30, gapHeight: 145, spacing: 163 },
      { gapY: 0.65, gapHeight: 145, spacing: 162 },
      { gapY: 0.35, gapHeight: 145, spacing: 160 },
      // 23번: 네 번째 텔레포트
      { gapY: 0.50, gapHeight: 145, spacing: 160, teleport: { inY: 0.75, outY: 0.30 } },
      { gapY: 0.42, gapHeight: 145, spacing: 160 },
      { gapY: 0.50, gapHeight: 145, spacing: 160 },
    ],
  },
];

export function getStageById(id: number): StageConfig | undefined {
  return STAGES.find((s) => s.id === id);
}
