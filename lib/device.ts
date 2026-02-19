/**
 * 기기 고유 ID 관리
 * localStorage에 유일하게 남는 영구 식별자
 */

const STORAGE_KEY = "flappy_device_id";

/** 기기 ID 조회 (없으면 null) */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** 기기 ID 생성 및 저장 (이미 있으면 기존 값 반환) */
export function getOrCreateDeviceId(): string {
  const existing = getDeviceId();
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
