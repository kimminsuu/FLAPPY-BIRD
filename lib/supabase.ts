/**
 * Supabase 클라이언트 초기화
 * - 환경변수에서 URL/Key 로드
 * - 빌드 타임 안전을 위해 빈 문자열 폴백
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
