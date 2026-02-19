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

### Backend
- TBD (Firebase / Supabase / Custom)

### Database
- TBD (Firestore / PostgreSQL)

### 외부 서비스
- 인앱 결제 (App Store / Google Play)

### DevOps / Infrastructure
- TBD

### Other Tools
- V0 (UI 목업)

### MCP (Model Context Protocol)
- **context7** - 최신 라이브러리 문서 참조 (필수)
- **github** - GitHub API 연동

---

## TODO List

### In Progress
- [ ] 실제 구현
  - [x] LoginScreen (사용자 이름/비밀번호)
  - [x] HomeScreen (메인 메뉴, 로그인/로그아웃 연동)
  - [x] GameScreen (Canvas 게임, 물리엔진, 파이프, 아이템 시스템, 코인 보상)
  - [x] BirdSelectionScreen (등급별 격자, 장착 기능)
  - [x] ModeSelectionScreen (RECORD / STAGE 모드 선택)
  - [x] StageSelectScreen (스테이지 선택, 3x5 격자, 잠금/오픈)
  - [x] Stage 3 텔레포트 기믹 (IN/OUT 포탈, 닫히는 파이프 애니메이션)
  - [x] Stage 4 "심연" (텔레포트 10개 연속, 좁은 갭)
  - [x] Stage 5 "역장" (중력 반전 존 4개)
  - [x] Stage 6 "혼돈" (텔레포트 + 중력 반전 혼합)
### Next Up
- [ ] 가챠(뽑기) 기능 UI
  - 코인 차감 로직
  - 뽑기 애니메이션
  - 결과 표시 모달

### Pending
- [ ] 로그인 API 연동 (현재 master 계정으로 임시 구현)
- [ ] 새(Bird) 데이터베이스 테이블 생성
  - birds 테이블: 새 정보 (id, name, rarity 등)
  - user_birds 테이블: 사용자별 보유 새 (user_id, bird_id, equipped 등)
- [ ] 코인 시스템 DB 연동 (현재 localStorage 임시 구현)
- [ ] (검토중) 10연차 할인 시스템 (1000 → 900코인)
- [ ] 모바일 반응형 스케일링 (배포 전 처리)
  - 기준 해상도: 390 x 844 (중형 폰)
  - 스케일 팩터: `canvasWidth / 390` 적용 (GAME_CONFIG 고정 px값 일괄 스케일링)
  - Safe Area 대응: 노치/다이나믹 아일랜드/홈 인디케이터 (`env(safe-area-inset-*)`)
  - 가로 모드 고정 (세로 모드 차단 + 회전 안내 UI)
  - 터치 영역 최소 44x44px 보장 (Apple HIG)
- [ ] 배포 (게임 개발 완료 후 진행)
  - 아키텍처: Vercel + Supabase (서버리스)
  - Supabase Auth 연동 (localStorage → Supabase Auth 이전)
  - Supabase PostgreSQL DB 연동 (코인, 새 보유 데이터 등)
  - localStorage 데이터 → DB 이전 (auth, coins, birds, equipped)
  - Vercel 배포 설정 (git push 자동 배포)
  - 사용자 증가 시 AWS (EC2 + RDS) 이관 검토

### Completed
- [x] GitHub에 repository 생성 및 추가
- [x] Agent 추가하기 (Code Review, Security 등)
- [x] 브랜치 전략 설정 (main/dev)
- [x] GitHub 템플릿 추가 (PR, Issue)
- [x] V0 목업 검토 및 기술 스택 결정 (Next.js)
- [x] 프로젝트 구조 설계
- [x] UI 컴포넌트 모듈화 (FlappyBird, SeasonalBackground)
- [x] 계절 테마 시스템 구현 (봄/여름/가을/겨울)
- [x] 글로벌 계절 테마 (React Context + localStorage)
- [x] BirdSelectionScreen UI (등급별 격자, 스크롤바, 장착)
- [x] 유저 정보 표시 (UserInfoBar: 이름 + 코인)
- [x] 장착 새 HomeScreen 연동
- [x] GameScreen 구현 (Canvas, 물리엔진, 아이템, 코인 보상)
- [x] 스테이지 모드 구현 (진행률 HUD, 최고 기록, 잠금 해제)
- [x] Stage 1 "초원", Stage 2 "숲길" 데이터
- [x] Stage 3 "동굴" (텔레포트 기믹: IN/OUT 포탈, 닫히는 파이프)
- [x] Stage 4 "심연" (텔레포트 10개 연속)
- [x] Stage 5 "역장" (중력 반전 존 4개)
- [x] Stage 6 "혼돈" (텔레포트 + 중력 반전 혼합, 존 3개)

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
커밋 직전 ──── 🔍 code-review + security-guidance (1회, 동시 실행)
    │           • 동일 diff를 공유하므로 묶어서 실행
    │           • security-guidance는 보안 관련 파일 변경 시에만 조건부 실행
    │             (로그인, 인증, API, 결제, 사용자 입력 처리 등)
    │
    ▼
PR 생성 직후 ── 🔍 pr-review-toolkit (1회)
                • PR 메타데이터(제목, 본문, 이슈 연결) 검증
                • 코드 리뷰는 1단계에서 완료되었으므로 중복 없음
```

**보안 관련 파일 기준**: `login-page.tsx`, `lib/auth*`, API 라우트, 결제 로직, `.env*` 등
**실행 제외 대상**: UI 스타일링, 게임 로직(물리엔진/렌더링), 타입 정의, 문서 수정 등

---

## Screens (앱 화면 구성)

| 화면 | Screen Name | 설명 |
|------|-------------|------|
| 로그인 | `LoginScreen` | 로그인 화면 |
| 홈 | `HomeScreen` | 메인 메뉴 (로그인 후) |
| 인게임 | `GameScreen` | 메인 게임 플레이 화면 |
| 모드 선택 | `ModeSelectionScreen` | 게임 모드 선택 (RECORD / STAGE) |
| 새 선택 | `BirdSelectionScreen` | 캐릭터 선택 및 구매 화면 |
| 스테이지 선택 | `StageSelectScreen` | 스테이지 모드 스테이지 선택 화면 |

### 화면 흐름 (Navigation Flow)
```
LoginScreen
    ↓ (로그인 성공)
HomeScreen ←→ BirdSelectionScreen
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
│   ├── mode-select/page.tsx    # 모드 선택 페이지
│   ├── stage-select/page.tsx   # 스테이지 선택 페이지
│   ├── page.tsx                # 메인 페이지
│   └── providers.tsx           # Context Providers
│
├── components/                 # UI 컴포넌트 (Frontend)
│   ├── ui/                     # 공통 UI 컴포넌트
│   │   ├── FlappyBird.tsx      # 새 아이콘 SVG
│   │   ├── SeasonalBackground.tsx # 계절 배경 테마
│   │   ├── SeasonSelector.tsx  # 배경 선택 드롭다운
│   │   ├── UserInfoBar.tsx     # 유저 정보 (이름 + 코인)
│   │   └── index.ts            # 컴포넌트 Export
│   ├── login-page.tsx          # 로그인 페이지
│   ├── home-page.tsx           # 홈 페이지
│   ├── bird-selection-page.tsx # 새 선택 페이지
│   ├── mode-selection-page.tsx # 모드 선택 페이지
│   ├── stage-select-page.tsx  # 스테이지 선택 페이지
│   └── game-page.tsx           # 게임 페이지 (Canvas 기반)
│
├── lib/                        # 비즈니스 로직 (Backend)
│   ├── birds.ts                # 새 데이터 및 매핑
│   └── stages.ts               # 스테이지 데이터 (파이프 배치, 기믹)
│
├── types/                      # TypeScript 타입 정의
│   ├── bird.ts                 # 새 관련 타입 정의
│   ├── game.ts                 # 게임 관련 타입 정의 (Pipe, TeleportPortal 등)
│   └── stage.ts                # 스테이지 관련 타입 정의 (StagePipeConfig, StageConfig)
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
├── .env.local                  # 환경 변수 (Git 제외)
├── .gitignore
└── CLAUDE.md                   # 프로젝트 문서
```

### 폴더 역할
| 폴더 | 역할 | 구분 |
|------|------|------|
| `app/` | 라우팅, 페이지 | Router |
| `components/` | UI 컴포넌트 | Frontend |
| `lib/` | 비즈니스 로직, 설정 | Backend |
| `types/` | 타입 정의 | Shared |

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
### 모바일 앱 고려 사항
- **터치 인터페이스**: 탭으로 새 점프 조작
- **오프라인 플레이**: 지원 여부 결정 필요
- **인앱 결제**: App Store / Google Play 결제 시스템
- **앱 스토어 배포**: iOS (App Store), Android (Google Play)
- **푸시 알림**: 친구 점수 갱신 알림 (선택)

### 앱 권한 (Permissions)
- 인터넷 접근
- (선택) 푸시 알림
