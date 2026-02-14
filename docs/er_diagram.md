# ER Diagram

프로젝트의 데이터베이스 엔터티 관계도입니다.

## Diagram

```mermaid
erDiagram
    USER {
        string id PK "유저 고유 ID (UUID)"
        string username UK "사용자명 (unique)"
        string password "비밀번호 (bcrypt 해시)"
        int coins "보유 코인 (기본값: 500)"
        int highScore "레코드 모드 최고 점수 (캐시)"
        string equippedBirdId FK "장착 중인 새 ID"
        string season "계절 테마 (spring/summer/autumn/winter)"
        datetime createdAt "가입일"
        datetime updatedAt "수정일"
    }

    BIRD {
        string id PK "새 ID (bird_common_1)"
        string name "영문 이름"
        string nameKo "한글 이름"
        enum rarity "등급 (common/rare/epic/unique)"
        string description "설명"
        string imagePath "이미지 경로 또는 svg"
        boolean isDefault "기본 새 여부"
    }

    USER_BIRD {
        string userId PK_FK "유저 ID (복합 PK)"
        string birdId PK_FK "새 ID (복합 PK)"
        datetime acquiredAt "획득일"
    }

    GAME_SCORE {
        string id PK "고유 ID (UUID)"
        string userId FK "유저 ID"
        enum mode "게임 모드 (record/stage)"
        int stageId "스테이지 번호 (nullable)"
        int score "점수"
        int coinsEarned "획득 코인"
        datetime playedAt "플레이 일시"
    }

    USER_STAGE_RECORD {
        string userId PK_FK "유저 ID (복합 PK)"
        int stageId PK "스테이지 번호 (복합 PK)"
        int bestPercent "최고 진행률 (0~100)"
        boolean cleared "클리어 여부"
        datetime clearedAt "클리어 일시 (nullable)"
        datetime updatedAt "최종 갱신일"
    }

    USER ||--o| BIRD : "equips"
    USER ||--o{ USER_BIRD : "owns"
    BIRD ||--o{ USER_BIRD : "owned by"
    USER ||--o{ GAME_SCORE : "plays"
    USER ||--o{ USER_STAGE_RECORD : "records"
```

## 설계 원칙

### 비정규화 (읽기 최적화)
- `USER.highScore`: GAME_SCORE에서 매번 `MAX(score) WHERE mode='record'` 쿼리하지 않도록 캐시
- `USER.equippedBirdId`: USER_BIRD 전체를 스캔하지 않고 장착 새 즉시 조회
- `USER.season`: 별도 설정 테이블 없이 USER에 인라인 (설정 항목이 1개뿐)

### 복합 PK (서로게이트 ID 제거)
- `USER_BIRD(userId, birdId)`: 유저당 같은 새 중복 불가 → UUID PK 불필요
- `USER_STAGE_RECORD(userId, stageId)`: 유저당 스테이지 1행 보장 → UUID PK 불필요
- 별도 UNIQUE 제약 없이 PK가 곧 유니크 보장, 인덱스 1개로 해결

### GAME_SCORE 부하 관리
- append-only 로그 테이블 (UPDATE 없음, INSERT만)
- 실시간 조회에 사용하지 않음 (최고점수는 USER.highScore 캐시 사용)
- 히스토리/통계 분석용도로만 SELECT
- 1000명 × 하루 50판 = 일 5만 행 → 월 150만 행 수준, 파티셔닝 불필요

---

## 엔터티 설명

| 엔터티 | 설명 | 예상 행 수 (1000유저) |
|--------|------|----------------------|
| `USER` | 사용자 정보 + 캐시 필드 | 1,000 |
| `BIRD` | 새(캐릭터) 마스터 데이터 (읽기 전용) | ~37 (고정) |
| `USER_BIRD` | 사용자별 보유 새 | ~10,000 (유저당 평균 10마리) |
| `GAME_SCORE` | 게임 플레이 로그 (append-only) | 증가 (월 ~150만) |
| `USER_STAGE_RECORD` | 유저별 스테이지 최고 기록 | ~15,000 (유저당 최대 15) |

---

## 관계

- **USER → BIRD**: 일대일 (equippedBirdId, 현재 장착 새)
- **USER ↔ BIRD**: 다대다 (USER_BIRD 중간 테이블, 보유 새)
- **USER → GAME_SCORE**: 일대다 (플레이 로그)
- **USER → USER_STAGE_RECORD**: 일대다 (스테이지별 최고 기록)

---

## 필드 상세

### USER
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | string | PK | UUID |
| username | string | UNIQUE, NOT NULL | 사용자명 |
| password | string | NOT NULL | bcrypt 해시 |
| coins | int | NOT NULL, DEFAULT 500 | 보유 코인 |
| highScore | int | NOT NULL, DEFAULT 0 | 레코드 모드 최고 점수 (캐시) |
| equippedBirdId | string | FK → BIRD.id, NOT NULL, DEFAULT 'bird_common_1' | 장착 중인 새 |
| season | string | NOT NULL, DEFAULT 'spring' | 계절 테마 |
| createdAt | datetime | NOT NULL | 가입일 |
| updatedAt | datetime | NOT NULL | 최종 수정일 |

### BIRD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | string | PK | bird_{rarity}_{number} |
| name | string | NOT NULL | 영문 이름 |
| nameKo | string | NOT NULL | 한글 이름 |
| rarity | enum | NOT NULL | common, rare, epic, unique |
| description | string | | 설명 |
| imagePath | string | NOT NULL | 이미지 경로 또는 "svg" |
| isDefault | boolean | NOT NULL, DEFAULT false | 기본 제공 새 여부 |

### USER_BIRD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| userId | string | PK, FK → USER.id | 유저 ID |
| birdId | string | PK, FK → BIRD.id | 새 ID |
| acquiredAt | datetime | NOT NULL | 획득 일시 |

### GAME_SCORE
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | string | PK | UUID |
| userId | string | FK → USER.id, NOT NULL | 유저 ID |
| mode | enum | NOT NULL | record / stage |
| stageId | int | NULLABLE | 스테이지 번호 (stage 모드만) |
| score | int | NOT NULL | 게임 점수 |
| coinsEarned | int | NOT NULL, DEFAULT 0 | 획득한 코인 |
| playedAt | datetime | NOT NULL | 플레이 일시 |

### USER_STAGE_RECORD
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| userId | string | PK, FK → USER.id | 유저 ID |
| stageId | int | PK | 스테이지 번호 |
| bestPercent | int | NOT NULL, DEFAULT 0 | 최고 진행률 (0~100) |
| cleared | boolean | NOT NULL, DEFAULT false | 클리어 여부 (빠른 필터링용) |
| clearedAt | datetime | NULLABLE | 클리어(100%) 달성 일시 |
| updatedAt | datetime | NOT NULL | 최종 갱신일 |

---

## 인덱스 설계

| 테이블 | 인덱스 | 타입 | 용도 |
|--------|--------|------|------|
| USER | username | UNIQUE | 로그인 조회 |
| USER_BIRD | (userId, birdId) | PK | 보유 새 조회 + 중복 방지 |
| USER_BIRD | (birdId) | INDEX | 새별 보유자 수 통계 (선택) |
| GAME_SCORE | (userId, playedAt) | INDEX | 유저별 최근 기록 조회 |
| GAME_SCORE | (mode, score DESC) | INDEX | 레코드 모드 랭킹 조회 |
| USER_STAGE_RECORD | (userId, stageId) | PK | 스테이지 기록 조회 + UPSERT |
