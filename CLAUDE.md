# FLAPPY-BIRD

> Flappy Bird 스타일의 캐주얼 모바일 게임 앱 (iOS / Android)

## Quick Start

```bash
npm install      # 설치
npm run dev      # 개발 서버
npm run build    # 빌드
npm run lint     # 린트
```

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Screens](#screens)
- [Workflow](#workflow)
- [TODO](#todo)
- [Notes](#notes)

---

## Tech Stack

| Category | Stack |
|----------|-------|
| Frontend | Next.js 16, React 18, TypeScript, Tailwind CSS |
| Auth | NextAuth.js, Kakao SDK |
| Backend | TBD (Firebase / Supabase) |
| Database | TBD (Firestore / PostgreSQL) |
| Icons | Lucide React |
| AI/MCP | context7 (필수), github |

---

## Project Structure

```
FLAPPY-BIRD/
├── app/                 # Next.js App Router
│   ├── api/auth/        # 인증 API
│   └── page.tsx         # 메인 페이지
├── components/          # UI 컴포넌트
│   ├── ui/              # 공통 UI
│   ├── login-page.tsx
│   ├── home-page.tsx
│   ├── game-page.tsx
│   ├── bird-selection-page.tsx
│   └── ranking-page.tsx
├── lib/                 # 비즈니스 로직
├── types/               # TypeScript 타입
├── images/birds/        # 새 이미지 (common/rare/epic/unique)
└── docs/                # 문서
```

| 폴더 | 역할 |
|------|------|
| `app/` | 라우팅, API |
| `components/` | UI 컴포넌트 |
| `lib/` | 비즈니스 로직 |
| `types/` | 타입 정의 |
| `docs/` | 상세 문서 |

---

## Documentation

| 문서 | 설명 |
|------|------|
| [docs/features.md](docs/features.md) | 핵심 기능 상세 (가챠, 이미지 규격 등) |
| [docs/er_diagram.md](docs/er_diagram.md) | DB 엔터티 관계도 |

> **Note**: 기능/엔터티 변경 시 해당 문서 업데이트 필수

---

## Screens

| Screen | File | 상태 |
|--------|------|------|
| LoginScreen | `login-page.tsx` | ✅ 완료 |
| HomeScreen | `home-page.tsx` | ⏳ placeholder |
| GameScreen | `game-page.tsx` | ⏳ placeholder |
| BirdSelectionScreen | `bird-selection-page.tsx` | ⏳ placeholder |
| RankingScreen | `ranking-page.tsx` | ⏳ placeholder |

### Navigation Flow

```
LoginScreen → HomeScreen ←→ BirdSelectionScreen
                 ↓                  ↓
            GameScreen        RankingScreen
                 ↓
            GameOverModal → HomeScreen
```

---

## Workflow

### Branch Strategy

```
main (production)
 └── dev (development)
      └── feature/*
```

### PR 규칙

1. `dev`에서 `feature/*` 브랜치 생성
2. 작업 완료 → `dev`로 PR
3. 테스트 후 `main`으로 Merge

---

## TODO

### In Progress
- [ ] 화면 구현
  - [x] LoginScreen
  - [ ] HomeScreen
  - [ ] GameScreen
  - [ ] BirdSelectionScreen
  - [ ] RankingScreen

### Pending
- [ ] 로그인 API 연동
- [ ] 카카오 SDK 연동
- [ ] DB 테이블 생성 (birds, user_birds)
- [ ] 코인 시스템 구현

### Completed
- [x] 프로젝트 구조 설계
- [x] UI 컴포넌트 모듈화
- [x] 계절 테마 시스템
- [x] 새 데이터/가챠 로직

---

## Notes

### 개발 규칙

- 작업 완료 시 문서 업데이트 검토
- 기능 개발 전 이슈 생성 필수
- PR은 `dev` 브랜치로 먼저

### Context7 MCP (필수)

```
"use context7로 Next.js App Router 구현해줘"
"use context7로 React 18 hooks 확인해줘"
```

### AI Agents

| Agent | 역할 |
|-------|------|
| code-review | 코드 품질 체크 |
| security-guidance | 보안 취약점 방지 |
| pr-review-toolkit | PR 리뷰 자동화 |

### 외부 연동

- 카카오 개발자 계정 필요
- 인앱 결제 (App Store / Google Play)
