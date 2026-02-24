-- ============================================================
-- FLAPPY BIRD - Database Migration
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. BIRD 테이블 (마스터 데이터, 읽기 전용)
CREATE TABLE bird (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'unique')),
  description TEXT,
  image_path TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false
);

-- 2. USER 테이블
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  coins INTEGER NOT NULL DEFAULT 500,
  high_score INTEGER NOT NULL DEFAULT 0,
  equipped_bird_id TEXT NOT NULL DEFAULT 'bird_common_1' REFERENCES bird(id),
  season TEXT NOT NULL DEFAULT 'spring',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USER_BIRD 테이블 (보유 새)
CREATE TABLE user_bird (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  bird_id TEXT NOT NULL REFERENCES bird(id),
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, bird_id)
);

-- 4. GAME_SCORE 테이블 (플레이 로그, append-only)
CREATE TABLE game_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('record', 'stage')),
  stage_id INTEGER,
  score INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. USER_STAGE_RECORD 테이블 (스테이지 최고 기록)
CREATE TABLE user_stage_record (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL,
  best_percent INTEGER NOT NULL DEFAULT 0,
  cleared BOOLEAN NOT NULL DEFAULT false,
  cleared_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, stage_id)
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_game_score_user_played ON game_score(user_id, played_at);
CREATE INDEX idx_game_score_ranking ON game_score(mode, score DESC);
CREATE INDEX idx_user_bird_bird ON user_bird(bird_id);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

-- BIRD: 모든 사용자 읽기 가능 (마스터 데이터)
ALTER TABLE bird ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bird_read_all" ON bird FOR SELECT USING (true);

-- USER: device_id 기반 자기 데이터만 접근
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_select_own" ON "user" FOR SELECT USING (true);
CREATE POLICY "user_insert" ON "user" FOR INSERT WITH CHECK (true);
CREATE POLICY "user_update_own" ON "user" FOR UPDATE USING (true);

-- USER_BIRD: 자기 데이터만 접근
ALTER TABLE user_bird ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_bird_select" ON user_bird FOR SELECT USING (true);
CREATE POLICY "user_bird_insert" ON user_bird FOR INSERT WITH CHECK (true);

-- GAME_SCORE: 자기 데이터만 접근
ALTER TABLE game_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY "game_score_select" ON game_score FOR SELECT USING (true);
CREATE POLICY "game_score_insert" ON game_score FOR INSERT WITH CHECK (true);

-- USER_STAGE_RECORD: 자기 데이터만 접근
ALTER TABLE user_stage_record ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_record_select" ON user_stage_record FOR SELECT USING (true);
CREATE POLICY "stage_record_insert" ON user_stage_record FOR INSERT WITH CHECK (true);
CREATE POLICY "stage_record_update" ON user_stage_record FOR UPDATE USING (true);

-- ============================================================
-- BIRD 마스터 데이터 시드 (37마리)
-- ============================================================
INSERT INTO bird (id, name, name_ko, rarity, description, image_path, is_default) VALUES
  -- COMMON (10)
  ('bird_common_1', 'Flappy', '플래피', 'common', 'The original Flappy Bird! Everyone starts with this cheerful yellow bird.', 'svg', true),
  ('bird_common_2', 'Blue', '파랑이', 'common', 'A cheerful blue bird soaring through the sky.', '/images/birds/common/bird_common_2.png', false),
  ('bird_common_3', 'Pink', '분홍이', 'common', 'A lovely pink bird with a sweet personality.', '/images/birds/common/bird_common_3.png', false),
  ('bird_common_4', 'Red', '빨강이', 'common', 'A bold red bird full of energy.', '/images/birds/common/bird_common_4.png', false),
  ('bird_common_5', 'Orange', '주황이', 'common', 'A bright orange bird that shines like the sun.', '/images/birds/common/bird_common_5.png', false),
  ('bird_common_6', 'Green', '초록이', 'common', 'A fresh green bird from the forest.', '/images/birds/common/bird_common_6.png', false),
  ('bird_common_7', 'Purple', '보라', 'common', 'A mysterious purple bird with elegance.', '/images/birds/common/bird_common_7.png', false),
  ('bird_common_8', 'Cyan', '청록이', 'common', 'A cool cyan bird from the ocean breeze.', '/images/birds/common/bird_common_8.png', false),
  ('bird_common_9', 'Brown', '갈색이', 'common', 'A cozy brown bird with warm feathers.', '/images/birds/common/bird_common_9.png', false),
  ('bird_common_10', 'Gray', '회색이', 'common', 'A calm gray bird with a gentle spirit.', '/images/birds/common/bird_common_10.png', false),
  -- RARE (9)
  ('bird_rare_1', 'Ruby', '루비새', 'rare', 'A sparkling bird made of precious ruby.', '/images/birds/rare/bird_rare_1.png', false),
  ('bird_rare_2', 'Emerald', '에메랄드새', 'rare', 'A shimmering bird made of emerald gems.', '/images/birds/rare/bird_rare_2.png', false),
  ('bird_rare_3', 'Gold', '황금새', 'rare', 'A luxurious bird made of pure gold.', '/images/birds/rare/bird_rare_3.png', false),
  ('bird_rare_4', 'Fire', '불새', 'rare', 'A blazing bird engulfed in flames.', '/images/birds/rare/bird_rare_4.png', false),
  ('bird_rare_5', 'Water', '물새', 'rare', 'A refreshing bird made of water droplets.', '/images/birds/rare/bird_rare_5.png', false),
  ('bird_rare_6', 'Leaf', '나뭇잎새', 'rare', 'A natural bird covered in green leaves.', '/images/birds/rare/bird_rare_6.png', false),
  ('bird_rare_7', 'Stone', '돌새', 'rare', 'A sturdy bird carved from stone.', '/images/birds/rare/bird_rare_7.png', false),
  ('bird_rare_8', 'Electric', '전기새', 'rare', 'A charged bird crackling with electricity.', '/images/birds/rare/bird_rare_8.png', false),
  ('bird_rare_9', 'Knit', '털실새', 'rare', 'A cozy bird knitted from colorful yarn.', '/images/birds/rare/bird_rare_9.png', false),
  -- EPIC (9)
  ('bird_epic_1', 'Puppy', '강아지', 'epic', 'A cute and loyal puppy with floppy ears.', '/images/birds/epic/bird_epic_1.png', false),
  ('bird_epic_2', 'Cat', '고양이', 'epic', 'A curious gray cat with big round eyes.', '/images/birds/epic/bird_epic_2.png', false),
  ('bird_epic_3', 'Hamster', '햄스터', 'epic', 'A chubby golden hamster with adorable cheeks.', '/images/birds/epic/bird_epic_3.png', false),
  ('bird_epic_4', 'Squirrel', '다람쥐', 'epic', 'A fluffy squirrel with a bushy tail.', '/images/birds/epic/bird_epic_4.png', false),
  ('bird_epic_5', 'Fox', '여우', 'epic', 'A clever orange fox with a fluffy tail.', '/images/birds/epic/bird_epic_5.png', false),
  ('bird_epic_6', 'Bear', '곰', 'epic', 'A friendly brown bear with a gentle face.', '/images/birds/epic/bird_epic_6.png', false),
  ('bird_epic_7', 'Monkey', '원숭이', 'epic', 'A playful monkey with a curly tail.', '/images/birds/epic/bird_epic_7.png', false),
  ('bird_epic_8', 'Dragon', '드래곤', 'epic', 'A cute green dragon with tiny wings.', '/images/birds/epic/bird_epic_8.png', false),
  ('bird_epic_9', 'Snake', '뱀', 'epic', 'A friendly green snake with big eyes.', '/images/birds/epic/bird_epic_9.png', false),
  -- UNIQUE (9)
  ('bird_unique_1', 'UFO', '우주선', 'unique', 'A mysterious UFO from outer space.', '/images/birds/unique/bird_unique_1.png', false),
  ('bird_unique_2', 'Race Car', '경주차', 'unique', 'A speedy race car with flames.', '/images/birds/unique/bird_unique_2.png', false),
  ('bird_unique_3', 'Airplane', '비행기', 'unique', 'A cute blue airplane soaring high.', '/images/birds/unique/bird_unique_3.png', false),
  ('bird_unique_4', 'Train', '기차', 'unique', 'A classic green steam train.', '/images/birds/unique/bird_unique_4.png', false),
  ('bird_unique_5', 'School Bus', '스쿨버스', 'unique', 'A cheerful yellow school bus.', '/images/birds/unique/bird_unique_5.png', false),
  ('bird_unique_6', 'Truck', '트럭', 'unique', 'A powerful red truck ready to haul.', '/images/birds/unique/bird_unique_6.png', false),
  ('bird_unique_7', 'Bicycle', '자전거', 'unique', 'A purple bicycle with a happy rider.', '/images/birds/unique/bird_unique_7.png', false),
  ('bird_unique_8', 'Motorcycle', '오토바이', 'unique', 'A cool motorcycle with flames.', '/images/birds/unique/bird_unique_8.png', false),
  ('bird_unique_9', 'Sailboat', '요트', 'unique', 'A peaceful sailboat on the sea.', '/images/birds/unique/bird_unique_9.png', false);

-- ============================================================
-- Daily Reward 컬럼 추가
-- ============================================================
ALTER TABLE "user" ADD COLUMN reward_day INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN last_reward_date TEXT DEFAULT NULL;
