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
      { gapY: 0.50, gapHeight: 146, spacing: 168, teleport: { inY: 0.65, outY: 0.30 } },
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
  {
    id: 4,
    name: "심연",
    pipeSpacing: 220,
    pipeSpeed: 2,
    goalScore: 30,
    enableItems: false,
    pipes: [
      // 초반 워밍업 (spacing 220~210, gap 150~147)
      { gapY: 0.45, gapHeight: 150 },
      { gapY: 0.52, gapHeight: 148, spacing: 215 },
      // 첫 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 147, spacing: 210, teleport: { inY: 0.68, outY: 0.22 } },
      { gapY: 0.60, gapHeight: 146, spacing: 205 },
      { gapY: 0.25, gapHeight: 145, spacing: 200 }, // △0.35
      // 두 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 144, spacing: 195, teleport: { inY: 0.28, outY: 0.76 } },
      { gapY: 0.70, gapHeight: 143, spacing: 190 },
      { gapY: 0.30, gapHeight: 142, spacing: 185 }, // △0.40
      // 세 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 142, spacing: 180, teleport: { inY: 0.75, outY: 0.20 } },
      { gapY: 0.32, gapHeight: 141, spacing: 178 },
      { gapY: 0.72, gapHeight: 140, spacing: 175 }, // △0.40
      // 네 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 140, spacing: 172, teleport: { inY: 0.25, outY: 0.78 } },
      { gapY: 0.68, gapHeight: 139, spacing: 170 },
      { gapY: 0.28, gapHeight: 138, spacing: 168 }, // △0.40
      // 다섯 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 138, spacing: 165, teleport: { inY: 0.72, outY: 0.22 } },
      { gapY: 0.30, gapHeight: 137, spacing: 163 },
      { gapY: 0.70, gapHeight: 136, spacing: 160 }, // △0.40
      // 여섯 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 136, spacing: 158, teleport: { inY: 0.70, outY: 0.78 } },
      { gapY: 0.72, gapHeight: 135, spacing: 156 },
      { gapY: 0.30, gapHeight: 135, spacing: 155 }, // △0.42
      // 일곱 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 134, spacing: 153, teleport: { inY: 0.30, outY: 0.20 } },
      { gapY: 0.28, gapHeight: 134, spacing: 152 },
      { gapY: 0.68, gapHeight: 133, spacing: 150 }, // △0.40
      // 여덟 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 133, spacing: 150, teleport: { inY: 0.70, outY: 0.78 } },
      { gapY: 0.72, gapHeight: 132, spacing: 150 },
      // 아홉 번째 텔레포트 (아래→위, 극한)
      { gapY: 0.50, gapHeight: 132, spacing: 150, teleport: { inY: 0.80, outY: 0.18 } },
      { gapY: 0.25, gapHeight: 131, spacing: 150 },
      { gapY: 0.68, gapHeight: 130, spacing: 150 }, // △0.43
      // 열 번째 텔레포트 (마지막, 위→아래)
      { gapY: 0.50, gapHeight: 130, spacing: 150, teleport: { inY: 0.35, outY: 0.78 } },
      { gapY: 0.78, gapHeight: 130, spacing: 150 },
    ],
  },
  {
    id: 5,
    name: "역장",
    pipeSpacing: 280,
    pipeSpeed: 2,
    goalScore: 30,
    enableItems: false,
    pipes: [
      // 일반 (파이프 1~2)
      { gapY: 0.45, gapHeight: 180 },
      { gapY: 0.50, gapHeight: 178, spacing: 270 },
      // ── 반전 존 1 (파이프 3~7, easy: 5파이프, 넓은 갭) ──
      { gapY: 0.48, gapHeight: 175, spacing: 265, reverseGravity: true },
      { gapY: 0.50, gapHeight: 173, spacing: 270 },
      { gapY: 0.52, gapHeight: 170, spacing: 270 },
      { gapY: 0.48, gapHeight: 168, spacing: 265 },
      { gapY: 0.50, gapHeight: 166, spacing: 265 },
      { gapY: 0.45, gapHeight: 165, spacing: 260, reverseGravity: false },
      // 일반 (파이프 9)
      { gapY: 0.52, gapHeight: 165, spacing: 250 },
      // ── 반전 존 2 (파이프 10~13, medium: 4파이프, 갭 감소) ──
      { gapY: 0.50, gapHeight: 162, spacing: 245, reverseGravity: true },
      { gapY: 0.47, gapHeight: 160, spacing: 250 },
      { gapY: 0.53, gapHeight: 158, spacing: 245 },
      { gapY: 0.48, gapHeight: 155, spacing: 240 },
      { gapY: 0.55, gapHeight: 155, spacing: 240, reverseGravity: false },
      // 일반 (파이프 15~16)
      { gapY: 0.42, gapHeight: 158, spacing: 235 },
      { gapY: 0.55, gapHeight: 155, spacing: 230 },
      // ── 반전 존 3 (파이프 17~20, medium+: 4파이프, 갭 더 감소) ──
      { gapY: 0.50, gapHeight: 153, spacing: 230, reverseGravity: true },
      { gapY: 0.46, gapHeight: 150, spacing: 240 },
      { gapY: 0.54, gapHeight: 148, spacing: 235 },
      { gapY: 0.48, gapHeight: 145, spacing: 230 },
      { gapY: 0.42, gapHeight: 148, spacing: 225, reverseGravity: false },
      // 일반 (파이프 22~23)
      { gapY: 0.55, gapHeight: 150, spacing: 225 },
      { gapY: 0.40, gapHeight: 148, spacing: 220 },
      // ── 반전 존 4 (파이프 24~28, hard: 5파이프, 좁은 갭) ──
      { gapY: 0.50, gapHeight: 145, spacing: 220, reverseGravity: true },
      { gapY: 0.45, gapHeight: 143, spacing: 230 },
      { gapY: 0.55, gapHeight: 140, spacing: 225 },
      { gapY: 0.42, gapHeight: 138, spacing: 220 },
      { gapY: 0.52, gapHeight: 136, spacing: 220 },
      { gapY: 0.48, gapHeight: 140, spacing: 215, reverseGravity: false },
      // 마무리 (파이프 30)
      { gapY: 0.50, gapHeight: 145, spacing: 215 },
    ],
  },
  {
    id: 6,
    name: "혼돈",
    pipeSpacing: 210,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 파이프 1~2: 일반 (워밍업)
      { gapY: 0.42, gapHeight: 155 },
      { gapY: 0.58, gapHeight: 153, spacing: 205 },                              // △0.16
      // 파이프 3: 텔레포트
      { gapY: 0.35, gapHeight: 152, spacing: 200, teleport: { inY: 0.70, outY: 0.25 } }, // △0.23
      // 파이프 4: 일반
      { gapY: 0.60, gapHeight: 150, spacing: 195 },                              // △0.25
      // ── 존 1 (파이프 5~8, 반전 + 텔레포트) ──
      { gapY: 0.35, gapHeight: 148, spacing: 190, reverseGravity: true },        // △0.25
      // 파이프 6: 텔레포트 (반전 존 안)
      { gapY: 0.60, gapHeight: 147, spacing: 190, teleport: { inY: 0.30, outY: 0.72 } }, // △0.25
      // 파이프 7~8: 일반 (반전 존 안)
      { gapY: 0.38, gapHeight: 146, spacing: 185 },                              // △0.22
      { gapY: 0.62, gapHeight: 145, spacing: 185 },                              // △0.24
      // ── 존 1 끝 ──
      { gapY: 0.40, gapHeight: 144, spacing: 180, reverseGravity: false },       // △0.22
      // 파이프 10~11: 일반
      { gapY: 0.65, gapHeight: 143, spacing: 200 },                              // △0.25
      { gapY: 0.35, gapHeight: 142, spacing: 195 },                              // △0.30
      // 파이프 12: 텔레포트
      { gapY: 0.62, gapHeight: 141, spacing: 195, teleport: { inY: 0.65, outY: 0.28 } }, // △0.27
      // 파이프 13~14: 일반
      { gapY: 0.38, gapHeight: 140, spacing: 190 },                              // △0.24
      { gapY: 0.65, gapHeight: 139, spacing: 190 },                              // △0.27
      // ── 존 2 (파이프 15~18, 반전 + 텔레포트) ──
      { gapY: 0.38, gapHeight: 138, spacing: 185, reverseGravity: true },        // △0.27
      // 파이프 16: 텔레포트 (반전 존 안)
      { gapY: 0.63, gapHeight: 137, spacing: 185, teleport: { inY: 0.28, outY: 0.75 } }, // △0.25
      // 파이프 17~18: 일반 (반전 존 안)
      { gapY: 0.35, gapHeight: 136, spacing: 180 },                              // △0.28
      { gapY: 0.60, gapHeight: 135, spacing: 180 },                              // △0.25
      // ── 존 2 끝 ──
      { gapY: 0.35, gapHeight: 135, spacing: 175, reverseGravity: false },       // △0.25
      // 파이프 20: 일반
      { gapY: 0.62, gapHeight: 134, spacing: 180 },                              // △0.27
      // 파이프 21: 텔레포트
      { gapY: 0.35, gapHeight: 133, spacing: 175, teleport: { inY: 0.72, outY: 0.25 } }, // △0.27
      // 파이프 22: 일반
      { gapY: 0.63, gapHeight: 132, spacing: 175 },                              // △0.28
      // ── 존 3 (파이프 23~25, 반전 + 텔레포트, 끝까지) ──
      { gapY: 0.37, gapHeight: 131, spacing: 170, reverseGravity: true },        // △0.26
      // 파이프 24: 텔레포트 (반전 존 안)
      { gapY: 0.63, gapHeight: 130, spacing: 170, teleport: { inY: 0.25, outY: 0.50 } }, // △0.26
      // 파이프 25: 일반 (반전 존 안, 마지막)
      { gapY: 0.36, gapHeight: 130, spacing: 165 },                              // △0.27
    ],
  },
];

export function getStageById(id: number): StageConfig | undefined {
  return STAGES.find((s) => s.id === id);
}
