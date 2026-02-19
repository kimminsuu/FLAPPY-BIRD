# Project Overview

프로젝트 이름: FLAPPY-BIRD
프로젝트 설명: Flappy Bird 스타일의 캐주얼 **모바일 게임 앱**
플랫폼: iOS / Android

---

## Tech Stack

### Frontend (확정)
- Next.js 16 (App Router, Turbopack)
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (아이콘)

### Backend (확정)
- Supabase (PostgreSQL + REST API)
- `@supabase/supabase-js` 클라이언트

### Database (확정)
- Supabase PostgreSQL
- 테이블: user, bird, user_bird, game_score, user_stage_record

### 외부 서비스
- 인앱 결제 (App Store / Google Play)

### DevOps / Infrastructure
- Vercel (웹 배포) — Phase 3 예정
- Capacitor (모바일 앱 패키징) — Phase 4 예정

### Other Tools
- V0 (UI 목업)

### MCP (Model Context Protocol)
- **context7** - 최신 라이브러리 문서 참조 (필수)
- **github** - GitHub API 연동

---

## TODO List

### In Progress
- [ ] 배포 작업 (Phase별 진행)
  - [x] Phase 1: Supabase DB 구축 (테이블, 시드, RLS, 마이그레이션)
  - [x] Phase 2: 프론트엔드 DB 연동 (localStorage → Supabase 전환)
  - [x] Phase 3: Vercel 웹 배포 (https://flappy-bird-nyey.vercel.app/)
  - [ ] Phase 4: 모바일 앱 패키징 (Capacitor)

### Next Up
- [ ] Stage 9~ 추가 기믹 설계 및 구현
- [ ] (검토중) 10연차 할인 시스템 (1000 → 900코인)

### Pending
- [ ] GAME_SCORE 테이블 활용 (현재 미사용, 필요 시 삽입)
  - `saveGameScore()` 함수는 `lib/user-service.ts`에 정의됨
  - 용도: 플레이 통계, 랭킹, 코인 획득 내역 추적
  - 게임 종료 시 `game-page.tsx`에서 호출 연결하면 활성화
- [ ] 모바일 반응형 스케일링 (Phase 4에서 처리)
  - 기준 해상도: 390 x 844 (중형 폰)
  - 스케일 팩터: `canvasWidth / 390` 적용 (GAME_CONFIG 고정 px값 일괄 스케일링)
  - Safe Area 대응: 노치/다이나믹 아일랜드/홈 인디케이터 (`env(safe-area-inset-*)`)
  - 가로 모드 고정 (세로 모드 차단 + 회전 안내 UI)
  - 터치 영역 최소 44x44px 보장 (Apple HIG)

### Completed
- [x] GitHub에 repository 생성 및 추가
- [x] Agent 추가하기 (Code Review, Security 등)
- [x] 브랜치 전략 설정 (main/dev)
- [x] GitHub 템플릿 추가 (PR, Issue)
- [x] V0 목업 검토 및 기술 스택 결정 (Next.js)
- [x] 프로젝트 구조 설계
- [x] UI 컴포넌트 모듈화 (FlappyBird, SeasonalBackground)
- [x] 계절 테마 시스템 구현 (봄/여름/가을/겨울)
- [x] 글로벌 계절 테마 (React Context + DB 저장)
- [x] BirdSelectionScreen UI (등급별 격자, 스크롤바, 장착)
- [x] 유저 정보 표시 (UserInfoBar: 이름 + 코인)
- [x] 장착 새 HomeScreen 연동
- [x] GameScreen 구현 (Canvas, 물리엔진, 아이템, 코인 보상)
- [x] 가챠(뽑기) 기능 UI (애니메이션, 코인 차감, 중복 환급)
- [x] 스테이지 모드 구현 (진행률 HUD, 최고 기록, 잠금 해제)
- [x] Stage 1 "초원", Stage 2 "숲길" 데이터
- [x] Stage 3 "동굴" (텔레포트 기믹: IN/OUT 포탈, 닫히는 파이프)
- [x] Stage 4 "심연" (텔레포트 10개 연속)
- [x] Stage 5 "역장" (중력 반전 존 4개)
- [x] Stage 6 "혼돈" (텔레포트 + 중력 반전 혼합, 존 3개)
- [x] Stage 7 "가속" (Speed Ring: Slow/Fast 링 기믹)
- [x] Stage 8 "질주" (Speed Ring 고밀도)
- [x] LoginScreen (닉네임 설정 → 기기 UUID + DB 유저 생성)
- [x] HomeScreen (메인 메뉴, 닉네임 변경, 장착 새 표시)
- [x] Supabase DB 구축 (Phase 1: 테이블, RLS, 시드, 마이그레이션)
- [x] 프론트엔드 DB 연동 (Phase 2: 모든 localStorage → Supabase 전환)

---

## 배포 Phase 계획

### 인증 방식 (변경됨)
| 항목 | 기존 계획 | 변경 후 |
|------|----------|---------|
| 인증 | Supabase Auth (이메일/비밀번호) | 불필요 (닉네임만 설정) |
| 사용자 식별 | 로그인 세션 | 기기 고유 ID (UUID) |
| 회원가입 | 필요 | 불필요 (닉네임 설정 = 유저 생성) |

### 핵심 구조
```
앱 설치 → 첫 실행 → 닉네임 입력 → 기기 UUID + 닉네임으로 DB에 유저 생성
           재실행 → 기기 UUID로 자동 식별 → 홈 화면 진입
```

### Phase 1: Supabase DB 구축 (완료)
1. Supabase 프로젝트 생성
2. ERD 수정 (USER 테이블에서 password 제거, device_id 추가)
3. 테이블 생성 (user, bird, user_bird, game_score, user_stage_record)
4. BIRD 마스터 데이터 시드 (37마리)
5. RLS 정책 설정
6. `supabase/migration.sql` 마이그레이션 파일 생성

### Phase 2: 프론트엔드 DB 연동 (완료)
1. `@supabase/supabase-js` 설치 + 클라이언트 초기화 (`lib/supabase.ts`)
2. 기기 UUID 유틸 (`lib/device.ts`) — localStorage에 영구 보관
3. 유저 Context (`lib/user-context.tsx`) — UserProvider + useUser hook
4. 데이터 서비스 (`lib/user-service.ts`) — 모든 CRUD를 Supabase로 처리
5. 계절 테마 DB 저장 (`lib/season-context.tsx`) — DB 우선, localStorage fallback
6. 모든 화면에서 localStorage 제거 → Supabase DB 사용

### Phase 3: Vercel 웹 배포 (완료)
1. Vercel 프로젝트 연결
2. 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. 프로덕션 빌드 + 배포 검증

### Phase 4: 모바일 앱 패키징 (예정)
1. Capacitor 설치 + iOS/Android 프로젝트 생성
2. 모바일 반응형 스케일링 + Safe Area 대응
3. 앱 스토어 배포

---

## Agent Types

프로젝트에서 사용하는 AI Agent 유형을 정의합니다.

| Agent Name | Role | Description |
|------------|------|-------------|
| code-review | 코드 리뷰 | PR 전 코드 품질 자동 체크 |
| security-guidance | 보안 가이드 | 보안 취약점 사전 방지 |
| pr-review-toolkit | PR 리뷰 | 이슈 연결 및 PR 리뷰 자동화 |

### Agent 실행 전략 (2-포인트)

토큰 효율을 위해 **feature 1개당 최대 2회** 실행합니다.

```
개발 중 (코드 작성/수정)
    │
    │  ← 에이전트 실행 없음 (토큰 절약)
    │
    ▼
커밋 직전 ──── code-review + security-guidance (1회, 동시 실행)
    │           • 동일 diff를 공유하므로 묶어서 실행
    │           • security-guidance는 보안 관련 파일 변경 시에만 조건부 실행
    │             (로그인, 인증, API, 결제, 사용자 입력 처리 등)
    │
    ▼
PR 생성 직후 ── pr-review-toolkit (1회)
                • PR 메타데이터(제목, 본문, 이슈 연결) 검증
                • 코드 리뷰는 1단계에서 완료되었으므로 중복 없음
```

**보안 관련 파일 기준**: `login-page.tsx`, `lib/user-service.ts`, `lib/supabase.ts`, `lib/user-context.tsx`, `.env*` 등
**실행 제외 대상**: UI 스타일링, 게임 로직(물리엔진/렌더링), 타입 정의, 문서 수정 등

---

## Screens (앱 화면 구성)

| 화면 | Screen Name | 설명 |
|------|-------------|------|
| 닉네임 설정 | `LoginScreen` | 닉네임 입력 (첫 실행 시) |
| 홈 | `HomeScreen` | 메인 메뉴 (닉네임 변경, 장착 새 표시) |
| 인게임 | `GameScreen` | 메인 게임 플레이 화면 |
| 모드 선택 | `ModeSelectionScreen` | 게임 모드 선택 (RECORD / STAGE) |
| 새 선택 | `BirdSelectionScreen` | 캐릭터 선택, 장착, 가챠 |
| 스테이지 선택 | `StageSelectScreen` | 스테이지 모드 스테이지 선택 화면 |

### 화면 흐름 (Navigation Flow)
```
첫 실행 → LoginScreen (닉네임 설정)
재실행 → 기기 UUID 자동 식별 → HomeScreen

HomeScreen ←→ BirdSelectionScreen (가챠/장착)
    ↓ (START)
ModeSelectionScreen
    ├── RECORD MODE → GameScreen → GameOverModal → HomeScreen
    └── STAGE MODE  → StageSelectScreen → GameScreen → ClearModal/GameOverModal
```

---

## KEY FEATURES

👉 [docs/features.md](docs/features.md) 참조

> **Note**: 기능 변경 시 `docs/features.md` 파일에 업데이트할 것

---

## Project Structure

```
FLAPPY-BIRD/
├── .github/                    # GitHub 템플릿
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│
├── app/                        # Next.js App Router (라우팅)
│   ├── globals.css             # 전역 스타일
│   ├── layout.tsx              # 루트 레이아웃
│   ├── bird-selection/page.tsx # 새 선택 페이지 라우트
│   ├── game/page.tsx           # 게임 페이지 라우트
│   ├── home/page.tsx           # 홈 페이지 라우트
│   ├── mode-select/page.tsx    # 모드 선택 페이지 라우트
│   ├── stage-select/page.tsx   # 스테이지 선택 페이지 라우트
│   ├── stage/[id]/page.tsx     # 스테이지별 게임 라우트
│   ├── page.tsx                # 메인 페이지 (로그인/홈 분기)
│   └── providers.tsx           # Context Providers (UserProvider + SeasonProvider)
│
├── components/                 # UI 컴포넌트 (Frontend)
│   ├── ui/                     # 공통 UI 컴포넌트
│   │   ├── FlappyBird.tsx      # 새 아이콘 SVG
│   │   ├── SeasonalBackground.tsx # 계절 배경 테마
│   │   ├── SeasonSelector.tsx  # 배경 선택 드롭다운
│   │   ├── UserInfoBar.tsx     # 유저 정보 (이름 + 코인)
│   │   └── index.ts            # 컴포넌트 Export
│   ├── login-page.tsx          # 닉네임 설정 페이지
│   ├── home-page.tsx           # 홈 페이지 (닉네임 변경 모달 포함)
│   ├── bird-selection-page.tsx # 새 선택 + 가챠 페이지
│   ├── mode-selection-page.tsx # 모드 선택 페이지
│   ├── stage-select-page.tsx   # 스테이지 선택 페이지
│   └── game-page.tsx           # 게임 페이지 (Canvas 기반)
│
├── lib/                        # 비즈니스 로직 (Backend)
│   ├── birds.ts                # 새 데이터, 매핑, 가챠 로직
│   ├── stages.ts               # 스테이지 데이터 (파이프 배치, 기믹)
│   ├── supabase.ts             # Supabase 클라이언트 초기화
│   ├── device.ts               # 기기 UUID 생성/관리
│   ├── user-context.tsx        # UserProvider + useUser hook
│   ├── user-service.ts         # Supabase CRUD (유저, 코인, 새, 점수, 스테이지)
│   └── season-context.tsx      # SeasonProvider + useSeason hook
│
├── types/                      # TypeScript 타입 정의
│   ├── bird.ts                 # 새 관련 타입 정의
│   ├── game.ts                 # 게임 관련 타입 정의 (Pipe, TeleportPortal 등)
│   └── stage.ts                # 스테이지 관련 타입 정의 (StagePipeConfig, StageConfig)
│
├── supabase/                   # Supabase 마이그레이션
│   └── migration.sql           # 테이블 생성 + RLS + 시드 데이터
│
├── public/                     # 정적 파일 (Next.js)
│   └── images/                 # 이미지 리소스
│       └── birds/              # 새 이미지
│           ├── common/         # COMMON 등급
│           ├── rare/           # RARE 등급
│           ├── epic/           # EPIC 등급
│           └── unique/         # UNIQUE 등급
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                  # 환경 변수 (Supabase URL/Key, Git 제외)
├── .gitignore
└── CLAUDE.md                   # 프로젝트 문서
```

### 폴더 역할
| 폴더 | 역할 | 구분 |
|------|------|------|
| `app/` | 라우팅, 페이지 | Router |
| `components/` | UI 컴포넌트 | Frontend |
| `lib/` | 비즈니스 로직, DB 서비스, Context | Backend |
| `types/` | 타입 정의 | Shared |
| `supabase/` | DB 마이그레이션 | Infrastructure |

---

## ER Diagram

👉 [docs/er_diagram.md](docs/er_diagram.md) 참조

> **Note**: 새로운 엔터티 추가 시 `docs/er_diagram.md` 파일에 업데이트할 것

---

## Commands

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트
npm run lint

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

---

## Workflow

### Branch Strategy

```
main (production)
 └── dev (development)
      ├── feature/login
      ├── feature/game
      └── feature/bird-selection
```

| Branch | Purpose |
|--------|---------|
| `main` | 배포 가능한 안정 버전 |
| `dev` | 개발 통합 브랜치 |
| `feature/*` | 기능별 작업 브랜치 |

### 작업 흐름
1. `dev`에서 `feature/*` 브랜치 생성
2. 작업 완료 → `dev`로 PR 생성 및 Merge
3. `dev`에서 충분히 테스트
4. 안정화되면 `main`으로 Merge

### PR 생성 시
- PR 생성 전 관련 이슈 확인 필수
- 이슈와 연결하여 PR 생성
- PR 템플릿 양식에 맞게 작성

---

## Notes

추가 참고 사항이나 주의점을 기록합니다.

### 개발 규칙
- 작업 완료 시 CLAUDE.md 업데이트 필요 여부 검토할 것
- 기능 개발 전 관련 이슈 생성 필수
- PR은 반드시 `dev` 브랜치로 먼저 머지
- 큰 기능 단위 작업 완료 시 `docs/daily_work/` 로그 작성 필수

### Context7 MCP 필수 사용 (중요!)
**모든 개발 작업 시 Context7 MCP를 사용하여 최신 문서를 참조할 것**

사용 방법:
- 프롬프트에 `use context7` 키워드 포함
- 라이브러리/프레임워크 관련 코드 작성 시 반드시 최신 문서 확인

예시:
```
"use context7로 Next.js App Router 라우팅 구현해줘"
"use context7로 Tailwind CSS 최신 문법 확인해줘"
"use context7로 React 18 hooks 사용법 알려줘"
```

참조 필수 항목:
- Next.js (App Router, Server Components)
- React 18 (Hooks, Suspense)
- Tailwind CSS
- TypeScript
- Supabase (supabase-js)

### 모바일 앱 고려 사항
- **터치 인터페이스**: 탭으로 새 점프 조작
- **오프라인 플레이**: 지원 여부 결정 필요
- **인앱 결제**: App Store / Google Play 결제 시스템
- **앱 스토어 배포**: iOS (App Store), Android (Google Play)
- **푸시 알림**: 친구 점수 갱신 알림 (선택)

### 앱 권한 (Permissions)
- 인터넷 접근
- (선택) 푸시 알림
