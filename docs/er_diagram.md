# ER Diagram

프로젝트의 데이터베이스 엔터티 관계도입니다.

## Diagram

```mermaid
erDiagram
    USER {
        string id PK "유저 고유 ID (UUID)"
        string device_id UK "기기 고유 ID (UUID)"
        string username UK "닉네임 (unique)"
        int coins "보유 코인 (기본값: 500)"
        int high_score "레코드 모드 최고 점수 (캐시)"
        string equipped_bird_id FK "장착 중인 새 ID"
        string season "계절 테마 (spring/summer/autumn/winter)"
        datetime created_at "생성일"
        datetime updated_at "수정일"
    }

    BIRD {
        string id PK "새 ID (bird_common_1)"
        string name "영문 이름"
        string name_ko "한글 이름"
        enum rarity "등급 (common/rare/epic/unique)"
        string description "설명"
        string image_path "이미지 경로 또는 svg"
        boolean is_default "기본 새 여부"
    }

    USER_BIRD {
        string user_id PK_FK "유저 ID (복합 PK)"
        string bird_id PK_FK "새 ID (복합 PK)"
        datetime acquired_at "획득일"
    }

    GAME_SCORE {
        string id PK "고유 ID (UUID)"
        string user_id FK "유저 ID"
        enum mode "게임 모드 (record/stage)"
        int stage_id "스테이지 번호 (nullable)"
        int score "점수"
        int coins_earned "획득 코인"
        datetime played_at "플레이 일시"
    }

    USER_STAGE_RECORD {
        string user_id PK_FK "유저 ID (복합 PK)"
        int stage_id PK "스테이지 번호 (복합 PK)"
        int best_percent "최고 진행률 (0~100)"
        boolean cleared "클리어 여부"
        datetime cleared_at "클리어 일시 (nullable)"
        datetime updated_at "최종 갱신일"
    }

    USER ||--o| BIRD : "equips"
    USER ||--o{ USER_BIRD : "owns"
    BIRD ||--o{ USER_BIRD : "owned by"
    USER ||--o{ GAME_SCORE : "plays"
    USER ||--o{ USER_STAGE_RECORD : "records"
```

## 설계 원칙

### 인증 방식: 기기 UUID 기반 (비밀번호 없음)
- 앱 첫 실행 시 `crypto.randomUUID()`로 기기 ID 생성 → `localStorage`에 영구 보관
- 닉네임 입력 시 기기 ID + 닉네임으로 유저 생성 (Supabase INSERT)
- 재실행 시 기기 ID로 자동 식별 (로그인/비밀번호 불필요)

### 비정규화 (읽기 최적화)
- `USER.high_score`: GAME_SCORE에서 매번 `MAX(score) WHERE mode='record'` 쿼리하지 않도록 캐시
- `USER.equipped_bird_id`: USER_BIRD 전체를 스캔하지 않고 장착 새 즉시 조회
- `USER.season`: 별도 설정 테이블 없이 USER에 인라인 (설정 항목이 1개뿐)

### 복합 PK (서로게이트 ID 제거)
- `USER_BIRD(user_id, bird_id)`: 유저당 같은 새 중복 불가 → UUID PK 불필요
- `USER_STAGE_RECORD(user_id, stage_id)`: 유저당 스테이지 1행 보장 → UUID PK 불필요
- 별도 UNIQUE 제약 없이 PK가 곧 유니크 보장, 인덱스 1개로 해결

### GAME_SCORE 부하 관리
- append-only 로그 테이블 (UPDATE 없음, INSERT만)
- 현재 미사용 (`saveGameScore()` 정의됨, 호출 미연결)
- 향후 필요 시 활성화: 플레이 통계, 랭킹, 코인 획득 내역 추적
- 1000명 x 하루 50판 = 일 5만 행 → 월 150만 행 수준, 파티셔닝 불필요

---

## 엔터티 설명

| 엔터티 | 설명 | 예상 행 수 (1000유저) |
|--------|------|----------------------|
| `USER` | 사용자 정보 + 캐시 필드 | 1,000 |
| `BIRD` | 새(캐릭터) 마스터 데이터 (읽기 전용) | ~37 (고정) |
| `USER_BIRD` | 사용자별 보유 새 | ~10,000 (유저당 평균 10마리) |
| `GAME_SCORE` | 게임 플레이 로그 (append-only, 현재 미사용) | 증가 (월 ~150만) |
| `USER_STAGE_RECORD` | 유저별 스테이지 최고 기록 | ~15,000 (유저당 최대 15) |

---

## 관계

- **USER → BIRD**: 일대일 (equipped_bird_id, 현재 장착 새)
- **USER ↔ BIRD**: 다대다 (USER_BIRD 중간 테이블, 보유 새)
- **USER → GAME_SCORE**: 일대다 (플레이 로그)
- **USER → USER_STAGE_RECORD**: 일대다 (스테이지별 최고 기록)

---

## 필드 상세

### USER
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 유저 고유 ID |
| device_id | TEXT | UNIQUE, NOT NULL | 기기 고유 ID |
| username | TEXT | UNIQUE, NOT NULL | 닉네임 |
| coins | INTEGER | NOT NULL, DEFAULT 500 | 보유 코인 |
| high_score | INTEGER | NOT NULL, DEFAULT 0 | 레코드 모드 최고 점수 (캐시) |
| equipped_bird_id | TEXT | FK → bird.id, NOT NULL, DEFAULT 'bird_common_1' | 장착 중인 새 |
| season | TEXT | NOT NULL, DEFAULT 'spring' | 계절 테마 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 최종 수정일 |

### BIRD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | TEXT | PK | bird_{rarity}_{number} |
| name | TEXT | NOT NULL | 영문 이름 |
| name_ko | TEXT | NOT NULL | 한글 이름 |
| rarity | TEXT | NOT NULL, CHECK | common, rare, epic, unique |
| description | TEXT | | 설명 |
| image_path | TEXT | NOT NULL | 이미지 경로 또는 "svg" |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | 기본 제공 새 여부 |

### USER_BIRD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| user_id | UUID | PK, FK → user.id, ON DELETE CASCADE | 유저 ID |
| bird_id | TEXT | PK, FK → bird.id | 새 ID |
| acquired_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 획득 일시 |

### GAME_SCORE (현재 미사용, 향후 활성화 예정)
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 고유 ID |
| user_id | UUID | FK → user.id, ON DELETE CASCADE, NOT NULL | 유저 ID |
| mode | TEXT | NOT NULL, CHECK (record/stage) | 게임 모드 |
| stage_id | INTEGER | NULLABLE | 스테이지 번호 (stage 모드만) |
| score | INTEGER | NOT NULL | 게임 점수 |
| coins_earned | INTEGER | NOT NULL, DEFAULT 0 | 획득한 코인 |
| played_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 플레이 일시 |

### USER_STAGE_RECORD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| user_id | UUID | PK, FK → user.id, ON DELETE CASCADE | 유저 ID |
| stage_id | INTEGER | PK | 스테이지 번호 |
| best_percent | INTEGER | NOT NULL, DEFAULT 0 | 최고 진행률 (0~100) |
| cleared | BOOLEAN | NOT NULL, DEFAULT false | 클리어 여부 (빠른 필터링용) |
| cleared_at | TIMESTAMPTZ | NULLABLE | 클리어(100%) 달성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 최종 갱신일 |

---

## 인덱스 설계

| 테이블 | 인덱스 | 타입 | 용도 |
|--------|--------|------|------|
| USER | device_id | UNIQUE | 기기 식별 조회 |
| USER | username | UNIQUE | 닉네임 중복 체크 |
| USER_BIRD | (user_id, bird_id) | PK | 보유 새 조회 + 중복 방지 |
| USER_BIRD | (bird_id) | INDEX | 새별 보유자 수 통계 (선택) |
| GAME_SCORE | (user_id, played_at) | INDEX | 유저별 최근 기록 조회 |
| GAME_SCORE | (mode, score DESC) | INDEX | 레코드 모드 랭킹 조회 |
| USER_STAGE_RECORD | (user_id, stage_id) | PK | 스테이지 기록 조회 + UPSERT |
