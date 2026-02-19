/**
 * 스테이지 모드 관련 타입 정의
 */

export interface StagePipeConfig {
  gapY: number; // gap 중심 y (0~1 비율, playableHeight 기준)
  gapHeight: number; // gap 높이 (px)
  spacing?: number; // 이 파이프까지의 간격 (프레임, 생략 시 pipeSpacing 사용)
  teleport?: {
    inY: number; // IN 포탈 y (0~1 비율)
    outY: number; // OUT 포탈 y (0~1 비율)
  };
  reverseGravity?: boolean; // true: 이 파이프부터 중력 반전 시작, false: 해제
  speedRing?: "slow" | "fast"; // 이 파이프 갭에 스피드 링 배치
}

export interface StageConfig {
  id: number;
  name: string;
  pipes: StagePipeConfig[]; // 미리 정의된 파이프 배열
  pipeSpacing: number; // 파이프 간 간격 (프레임)
  pipeSpeed: number; // 파이프 이동 속도
  goalScore: number; // 클리어에 필요한 통과 파이프 수
  enableItems: boolean; // 아이템 활성화 여부
}
