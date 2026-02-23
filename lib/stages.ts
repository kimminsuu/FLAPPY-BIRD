/**
 * 스테이지 데이터 정의
 */

import type { StageConfig } from "@/types/stage";

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: "초원",
    pipeSpacing: 298,
    pipeSpeed: 2,
    goalScore: 15,
    enableItems: false,
    pipes: [
      { gapY: 0.45, gapHeight: 150 },
      { gapY: 0.50, gapHeight: 150 },
      { gapY: 0.42, gapHeight: 150 },
      { gapY: 0.55, gapHeight: 146 },
      { gapY: 0.38, gapHeight: 146 },
      { gapY: 0.50, gapHeight: 146 },
      { gapY: 0.46, gapHeight: 143 },
      { gapY: 0.58, gapHeight: 143 },
      { gapY: 0.40, gapHeight: 143 },
      { gapY: 0.52, gapHeight: 143 },
      { gapY: 0.35, gapHeight: 139 },
      { gapY: 0.48, gapHeight: 139 },
      { gapY: 0.55, gapHeight: 139 },
      { gapY: 0.42, gapHeight: 139 },
      { gapY: 0.50, gapHeight: 139 },
    ],
  },
  {
    id: 2,
    name: "숲길",
    pipeSpacing: 238,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 초반 (gap 120~118, y변화 소)
      { gapY: 0.45, gapHeight: 120 },
      { gapY: 0.50, gapHeight: 119, spacing: 234 },
      { gapY: 0.42, gapHeight: 119, spacing: 230 },
      { gapY: 0.52, gapHeight: 119, spacing: 226 },
      { gapY: 0.40, gapHeight: 118, spacing: 222 },
      // 중반 진입 (gap 117~114, y변화 중)
      { gapY: 0.58, gapHeight: 117, spacing: 218 },
      { gapY: 0.35, gapHeight: 116, spacing: 213 },
      { gapY: 0.60, gapHeight: 116, spacing: 208 },
      { gapY: 0.38, gapHeight: 115, spacing: 203 },
      { gapY: 0.55, gapHeight: 114, spacing: 198 },
      // 중반 (gap 113~110, y변화 대 ~1/4)
      { gapY: 0.28, gapHeight: 113, spacing: 193 },
      { gapY: 0.58, gapHeight: 113, spacing: 188 },
      { gapY: 0.32, gapHeight: 112, spacing: 183 },
      { gapY: 0.62, gapHeight: 111, spacing: 178 },
      { gapY: 0.38, gapHeight: 110, spacing: 173 },
      // 후반 (gap 110~107, y변화 대 ~1/3)
      { gapY: 0.70, gapHeight: 110, spacing: 166 },
      { gapY: 0.35, gapHeight: 109, spacing: 162 },
      { gapY: 0.68, gapHeight: 108, spacing: 158 },
      { gapY: 0.32, gapHeight: 108, spacing: 154 },
      { gapY: 0.65, gapHeight: 107, spacing: 150 },
      // 마무리 (gap 107~105, y변화 극대 ~1/3)
      { gapY: 0.30, gapHeight: 107, spacing: 146 },
      { gapY: 0.65, gapHeight: 106, spacing: 143 },
      { gapY: 0.33, gapHeight: 106, spacing: 141 },
      { gapY: 0.60, gapHeight: 105, spacing: 139 },
      { gapY: 0.45, gapHeight: 105, spacing: 138 },
    ],
  },
  {
    id: 3,
    name: "동굴",
    pipeSpacing: 228,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 초반 (gap 120~116)
      { gapY: 0.45, gapHeight: 120 },
      { gapY: 0.50, gapHeight: 119, spacing: 223 },
      { gapY: 0.40, gapHeight: 118, spacing: 218 },
      { gapY: 0.55, gapHeight: 117, spacing: 213 },
      // 5번: 첫 번째 텔레포트
      { gapY: 0.50, gapHeight: 116, spacing: 208, teleport: { inY: 0.70, outY: 0.25 } },
      { gapY: 0.42, gapHeight: 116, spacing: 203 },
      { gapY: 0.58, gapHeight: 116, spacing: 198 },
      { gapY: 0.35, gapHeight: 115, spacing: 193 },
      { gapY: 0.55, gapHeight: 114, spacing: 188 },
      { gapY: 0.40, gapHeight: 113, spacing: 183 },
      // 11번: 두 번째 텔레포트
      { gapY: 0.50, gapHeight: 113, spacing: 178, teleport: { inY: 0.30, outY: 0.72 } },
      { gapY: 0.60, gapHeight: 113, spacing: 173 },
      { gapY: 0.35, gapHeight: 112, spacing: 170 },
      { gapY: 0.62, gapHeight: 111, spacing: 166 },
      { gapY: 0.38, gapHeight: 111, spacing: 163 },
      { gapY: 0.55, gapHeight: 110, spacing: 160 },
      { gapY: 0.32, gapHeight: 110, spacing: 158 },
      // 18번: 세 번째 텔레포트
      { gapY: 0.50, gapHeight: 110, spacing: 156, teleport: { inY: 0.65, outY: 0.30 } },
      { gapY: 0.58, gapHeight: 110, spacing: 153 },
      { gapY: 0.30, gapHeight: 109, spacing: 151 },
      { gapY: 0.65, gapHeight: 109, spacing: 150 },
      { gapY: 0.35, gapHeight: 109, spacing: 148 },
      // 23번: 네 번째 텔레포트
      { gapY: 0.50, gapHeight: 109, spacing: 148, teleport: { inY: 0.75, outY: 0.30 } },
      { gapY: 0.42, gapHeight: 109, spacing: 148 },
      { gapY: 0.50, gapHeight: 109, spacing: 148 },
    ],
  },
  {
    id: 4,
    name: "심연",
    pipeSpacing: 208,
    pipeSpeed: 2,
    goalScore: 30,
    enableItems: false,
    pipes: [
      // 초반 워밍업
      { gapY: 0.45, gapHeight: 113 },
      { gapY: 0.52, gapHeight: 111, spacing: 203 },
      // 첫 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 110, spacing: 198, teleport: { inY: 0.68, outY: 0.22 } },
      { gapY: 0.60, gapHeight: 110, spacing: 193 },
      { gapY: 0.25, gapHeight: 109, spacing: 188 },
      // 두 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 108, spacing: 183, teleport: { inY: 0.28, outY: 0.76 } },
      { gapY: 0.70, gapHeight: 107, spacing: 178 },
      { gapY: 0.30, gapHeight: 107, spacing: 173 },
      // 세 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 107, spacing: 168, teleport: { inY: 0.75, outY: 0.20 } },
      { gapY: 0.32, gapHeight: 106, spacing: 166 },
      { gapY: 0.72, gapHeight: 105, spacing: 163 },
      // 네 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 105, spacing: 160, teleport: { inY: 0.25, outY: 0.78 } },
      { gapY: 0.68, gapHeight: 104, spacing: 158 },
      { gapY: 0.28, gapHeight: 104, spacing: 156 },
      // 다섯 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 104, spacing: 153, teleport: { inY: 0.72, outY: 0.22 } },
      { gapY: 0.30, gapHeight: 103, spacing: 151 },
      { gapY: 0.70, gapHeight: 102, spacing: 148 },
      // 여섯 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 102, spacing: 146, teleport: { inY: 0.70, outY: 0.78 } },
      { gapY: 0.72, gapHeight: 101, spacing: 144 },
      { gapY: 0.30, gapHeight: 101, spacing: 143 },
      // 일곱 번째 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 101, spacing: 141, teleport: { inY: 0.30, outY: 0.20 } },
      { gapY: 0.28, gapHeight: 101, spacing: 140 },
      { gapY: 0.68, gapHeight: 100, spacing: 138 },
      // 여덟 번째 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 100, spacing: 138, teleport: { inY: 0.70, outY: 0.78 } },
      { gapY: 0.72, gapHeight: 99, spacing: 138 },
      // 아홉 번째 텔레포트 (아래→위, 극한)
      { gapY: 0.50, gapHeight: 99, spacing: 138, teleport: { inY: 0.80, outY: 0.18 } },
      { gapY: 0.25, gapHeight: 98, spacing: 138 },
      { gapY: 0.68, gapHeight: 98, spacing: 138 },
      // 열 번째 텔레포트 (마지막, 위→아래)
      { gapY: 0.50, gapHeight: 98, spacing: 138, teleport: { inY: 0.35, outY: 0.78 } },
      { gapY: 0.78, gapHeight: 98, spacing: 138 },
    ],
  },
  {
    id: 5,
    name: "역장",
    pipeSpacing: 268,
    pipeSpeed: 2,
    goalScore: 30,
    enableItems: false,
    pipes: [
      // 일반 (파이프 1~2)
      { gapY: 0.45, gapHeight: 135 },
      { gapY: 0.50, gapHeight: 134, spacing: 258 },
      // ── 반전 존 1 (easy: 5파이프, 넓은 갭) ──
      { gapY: 0.48, gapHeight: 131, spacing: 253, reverseGravity: true },
      { gapY: 0.50, gapHeight: 130, spacing: 258 },
      { gapY: 0.52, gapHeight: 128, spacing: 258 },
      { gapY: 0.48, gapHeight: 126, spacing: 253 },
      { gapY: 0.50, gapHeight: 125, spacing: 253 },
      { gapY: 0.45, gapHeight: 124, spacing: 248, reverseGravity: false },
      // 일반 (파이프 9)
      { gapY: 0.52, gapHeight: 124, spacing: 238 },
      // ── 반전 존 2 (medium: 4파이프, 갭 감소) ──
      { gapY: 0.50, gapHeight: 122, spacing: 233, reverseGravity: true },
      { gapY: 0.47, gapHeight: 120, spacing: 238 },
      { gapY: 0.53, gapHeight: 119, spacing: 233 },
      { gapY: 0.48, gapHeight: 116, spacing: 228 },
      { gapY: 0.55, gapHeight: 116, spacing: 228, reverseGravity: false },
      // 일반 (파이프 15~16)
      { gapY: 0.42, gapHeight: 119, spacing: 223 },
      { gapY: 0.55, gapHeight: 116, spacing: 218 },
      // ── 반전 존 3 (medium+: 4파이프) ──
      { gapY: 0.50, gapHeight: 115, spacing: 218, reverseGravity: true },
      { gapY: 0.46, gapHeight: 113, spacing: 228 },
      { gapY: 0.54, gapHeight: 111, spacing: 223 },
      { gapY: 0.48, gapHeight: 109, spacing: 218 },
      { gapY: 0.42, gapHeight: 111, spacing: 213, reverseGravity: false },
      // 일반 (파이프 22~23)
      { gapY: 0.55, gapHeight: 113, spacing: 213 },
      { gapY: 0.40, gapHeight: 111, spacing: 208 },
      // ── 반전 존 4 (hard: 5파이프, 좁은 갭) ──
      { gapY: 0.50, gapHeight: 109, spacing: 208, reverseGravity: true },
      { gapY: 0.45, gapHeight: 107, spacing: 218 },
      { gapY: 0.55, gapHeight: 105, spacing: 213 },
      { gapY: 0.42, gapHeight: 104, spacing: 208 },
      { gapY: 0.52, gapHeight: 102, spacing: 208 },
      { gapY: 0.48, gapHeight: 105, spacing: 203, reverseGravity: false },
      // 마무리 (파이프 30)
      { gapY: 0.50, gapHeight: 109, spacing: 203 },
    ],
  },
  {
    id: 6,
    name: "혼돈",
    pipeSpacing: 198,
    pipeSpeed: 2,
    goalScore: 25,
    enableItems: false,
    pipes: [
      // 파이프 1~2: 일반 (워밍업)
      { gapY: 0.42, gapHeight: 116 },
      { gapY: 0.58, gapHeight: 115, spacing: 193 },
      // 파이프 3: 텔레포트
      { gapY: 0.35, gapHeight: 114, spacing: 188, teleport: { inY: 0.70, outY: 0.25 } },
      // 파이프 4: 일반
      { gapY: 0.60, gapHeight: 113, spacing: 183 },
      // ── 존 1 (반전 + 텔레포트) ──
      { gapY: 0.35, gapHeight: 111, spacing: 178, reverseGravity: true },
      // 파이프 6: 텔레포트 (반전 존 안)
      { gapY: 0.60, gapHeight: 110, spacing: 178, teleport: { inY: 0.30, outY: 0.72 } },
      // 파이프 7~8: 일반 (반전 존 안)
      { gapY: 0.38, gapHeight: 110, spacing: 173 },
      { gapY: 0.62, gapHeight: 109, spacing: 173 },
      // ── 존 1 끝 ──
      { gapY: 0.40, gapHeight: 108, spacing: 168, reverseGravity: false },
      // 파이프 10~11: 일반
      { gapY: 0.65, gapHeight: 107, spacing: 188 },
      { gapY: 0.35, gapHeight: 107, spacing: 183 },
      // 파이프 12: 텔레포트
      { gapY: 0.62, gapHeight: 106, spacing: 183, teleport: { inY: 0.65, outY: 0.28 } },
      // 파이프 13~14: 일반
      { gapY: 0.38, gapHeight: 105, spacing: 178 },
      { gapY: 0.65, gapHeight: 104, spacing: 178 },
      // ── 존 2 (반전 + 텔레포트) ──
      { gapY: 0.38, gapHeight: 104, spacing: 173, reverseGravity: true },
      // 파이프 16: 텔레포트 (반전 존 안)
      { gapY: 0.63, gapHeight: 103, spacing: 173, teleport: { inY: 0.28, outY: 0.75 } },
      // 파이프 17~18: 일반 (반전 존 안)
      { gapY: 0.35, gapHeight: 102, spacing: 168 },
      { gapY: 0.60, gapHeight: 101, spacing: 168 },
      // ── 존 2 끝 ──
      { gapY: 0.35, gapHeight: 101, spacing: 163, reverseGravity: false },
      // 파이프 20: 일반
      { gapY: 0.62, gapHeight: 101, spacing: 168 },
      // 파이프 21: 텔레포트
      { gapY: 0.35, gapHeight: 100, spacing: 163, teleport: { inY: 0.72, outY: 0.25 } },
      // 파이프 22: 일반
      { gapY: 0.63, gapHeight: 99, spacing: 163 },
      // ── 존 3 (반전 + 텔레포트, 끝까지) ──
      { gapY: 0.37, gapHeight: 98, spacing: 158, reverseGravity: true },
      // 파이프 24: 텔레포트 (반전 존 안)
      { gapY: 0.63, gapHeight: 98, spacing: 158, teleport: { inY: 0.25, outY: 0.50 } },
      // 파이프 25: 일반 (반전 존 안, 마지막)
      { gapY: 0.36, gapHeight: 98, spacing: 153 },
    ],
  },
  {
    id: 7,
    name: "가속",
    pipeSpacing: 208,
    pipeSpeed: 2,
    goalScore: 35,
    enableItems: false,
    pipes: [
      // 워밍업 (1~2)
      { gapY: 0.45, gapHeight: 131 },
      { gapY: 0.52, gapHeight: 131, spacing: 168 },
      // ★ 파이프 3: SLOW
      { gapY: 0.48, gapHeight: 130, spacing: 167, speedRing: "slow" },
      // 4~7: 버퍼 4개
      { gapY: 0.55, gapHeight: 129, spacing: 166 },
      { gapY: 0.40, gapHeight: 128, spacing: 166 },
      { gapY: 0.58, gapHeight: 128, spacing: 165 },
      { gapY: 0.42, gapHeight: 127, spacing: 164 },
      // ★ 파이프 8: SLOW
      { gapY: 0.52, gapHeight: 126, spacing: 163, speedRing: "slow" },
      // 9~12: 버퍼 4개
      { gapY: 0.38, gapHeight: 125, spacing: 163 },
      { gapY: 0.60, gapHeight: 125, spacing: 162 },
      { gapY: 0.35, gapHeight: 124, spacing: 161 },
      { gapY: 0.55, gapHeight: 123, spacing: 160 },
      // ★ 파이프 13: FAST
      { gapY: 0.42, gapHeight: 122, spacing: 160, speedRing: "fast" },
      // 14~19: 버퍼 6개
      { gapY: 0.60, gapHeight: 122, spacing: 159 },
      { gapY: 0.35, gapHeight: 121, spacing: 158 },
      { gapY: 0.58, gapHeight: 120, spacing: 157 },
      { gapY: 0.40, gapHeight: 119, spacing: 157 },
      { gapY: 0.62, gapHeight: 119, spacing: 156 },
      { gapY: 0.38, gapHeight: 117, spacing: 155 },
      // ★ 파이프 20: SLOW
      { gapY: 0.55, gapHeight: 116, spacing: 154, speedRing: "slow" },
      // 21~24: 버퍼 4개
      { gapY: 0.33, gapHeight: 116, spacing: 154 },
      { gapY: 0.60, gapHeight: 115, spacing: 153 },
      { gapY: 0.40, gapHeight: 114, spacing: 152 },
      { gapY: 0.58, gapHeight: 113, spacing: 151 },
      // ★ 파이프 25: SLOW
      { gapY: 0.42, gapHeight: 113, spacing: 151, speedRing: "slow" },
      // 26~29: 버퍼 4개
      { gapY: 0.62, gapHeight: 112, spacing: 150 },
      { gapY: 0.35, gapHeight: 111, spacing: 149 },
      { gapY: 0.55, gapHeight: 110, spacing: 148 },
      { gapY: 0.40, gapHeight: 110, spacing: 148 },
      // ★ 파이프 30: FAST
      { gapY: 0.50, gapHeight: 109, spacing: 147, speedRing: "fast" },
      // 31~35: 마무리 5개
      { gapY: 0.58, gapHeight: 108, spacing: 146 },
      { gapY: 0.35, gapHeight: 107, spacing: 145 },
      { gapY: 0.52, gapHeight: 107, spacing: 145 },
      { gapY: 0.45, gapHeight: 106, spacing: 144 },
      { gapY: 0.50, gapHeight: 105, spacing: 143 },
    ],
  },
  {
    id: 8,
    name: "융합",
    pipeSpacing: 208,
    pipeSpeed: 2,
    goalScore: 35,
    enableItems: false,
    pipes: [
      // ── 구간 1: 워밍업 + SLOW 링 (1~5) ──
      { gapY: 0.45, gapHeight: 128 },
      { gapY: 0.52, gapHeight: 127, spacing: 163 },
      // ★ 파이프 3: SLOW
      { gapY: 0.48, gapHeight: 126, spacing: 162, speedRing: "slow" },
      { gapY: 0.55, gapHeight: 125, spacing: 162 },
      { gapY: 0.40, gapHeight: 125, spacing: 161 },

      // ── 구간 2: 텔레포트 (6~10) ──
      { gapY: 0.58, gapHeight: 125, spacing: 160 },
      // 파이프 7: 텔레포트 (아래→위)
      { gapY: 0.50, gapHeight: 124, spacing: 160, teleport: { inY: 0.70, outY: 0.25 } },
      // ★ 파이프 8: SLOW
      { gapY: 0.42, gapHeight: 123, spacing: 159, speedRing: "slow" },
      { gapY: 0.60, gapHeight: 122, spacing: 158 },
      { gapY: 0.35, gapHeight: 122, spacing: 158 },

      // ── 구간 3: 중력 반전 존 1 (11~16) ──
      { gapY: 0.55, gapHeight: 122, spacing: 157 },
      // 파이프 12: 반전 시작
      { gapY: 0.48, gapHeight: 121, spacing: 156, reverseGravity: true },
      // ★ 파이프 13: FAST
      { gapY: 0.52, gapHeight: 120, spacing: 156, speedRing: "fast" },
      { gapY: 0.45, gapHeight: 119, spacing: 155 },
      { gapY: 0.50, gapHeight: 119, spacing: 154 },
      // 파이프 16: 반전 해제
      { gapY: 0.48, gapHeight: 119, spacing: 154, reverseGravity: false },

      // ── 구간 4: 회복 + 텔레포트 (17~21) ──
      { gapY: 0.55, gapHeight: 118, spacing: 153 },
      { gapY: 0.38, gapHeight: 117, spacing: 152 },
      // 파이프 19: 텔레포트 (위→아래)
      { gapY: 0.50, gapHeight: 116, spacing: 152, teleport: { inY: 0.28, outY: 0.3 } },
      // ★ 파이프 20: SLOW
      { gapY: 0.42, gapHeight: 116, spacing: 151, speedRing: "slow" },
      { gapY: 0.60, gapHeight: 115, spacing: 150 },

      // ── 구간 5: 중력 반전 존 2 + SLOW 링 (22~28) ──
      { gapY: 0.35, gapHeight: 115, spacing: 150 },
      { gapY: 0.55, gapHeight: 114, spacing: 149 },
      // 파이프 24: 반전 시작
      { gapY: 0.48, gapHeight: 113, spacing: 148, reverseGravity: true },
      // ★ 파이프 25: SLOW
      { gapY: 0.52, gapHeight: 113, spacing: 148, speedRing: "slow" },
      { gapY: 0.45, gapHeight: 112, spacing: 147 },
      // 파이프 27: 반전 해제
      { gapY: 0.50, gapHeight: 111, spacing: 146, reverseGravity: false },
      { gapY: 0.58, gapHeight: 110, spacing: 145 },

      // ── 구간 6: 텔레포트 + FAST 피날레 (29~35) ──
      { gapY: 0.38, gapHeight: 110, spacing: 145 },
      // ★ 파이프 30: FAST
      { gapY: 0.55, gapHeight: 110, spacing: 144, speedRing: "fast" },
      // 파이프 31: 텔레포트 (아래→위, fast 중 통과)
      { gapY: 0.50, gapHeight: 109, spacing: 143, teleport: { inY: 0.68, outY: 0.28 } },
      { gapY: 0.42, gapHeight: 108, spacing: 142 },
      { gapY: 0.58, gapHeight: 107, spacing: 141 },
      { gapY: 0.45, gapHeight: 106, spacing: 140 },
      { gapY: 0.50, gapHeight: 105, spacing: 138 },
    ],
  },
];

export function getStageById(id: number): StageConfig | undefined {
  return STAGES.find((s) => s.id === id);
}
