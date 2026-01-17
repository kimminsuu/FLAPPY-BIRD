# Project Overview

프로젝트 이름: FLAPPY-BIRD
프로젝트 설명: Flappy Bird 스타일의 캐주얼 게임

---

## Tech Stack

### Frontend
-

### Backend
-

### Database
-

### DevOps / Infrastructure
-

### Other Tools
-

---

## TODO List

### In Progress
- [ ] V0 목업 검토 및 기술 스택 결정 (React Native, Flutter, Unity 등)

### Pending
- [ ] 프로젝트 구조 설계
- [ ] 실제 구현
  - [ ] 로그인 페이지 (사용자 이름/비밀번호, 카카오 ID 연동)
  - [ ] 인게임 화면 (새 조작, 점수, 파이프 장애물)
  - [ ] 새 선택 화면 (COMMON, RARE, EPIC, UNIQUE 등급)
  - [ ] 랭킹 화면 (카카오톡 친구 기반)

### Completed
- [x] GitHub에 repository 생성 및 추가
- [x] Agent 추가하기 (Code Review, Security 등)
- [x] 브랜치 전략 설정 (main/dev)
- [x] GitHub 템플릿 추가 (PR, Issue)

---

## Agent Types

프로젝트에서 사용하는 AI Agent 유형을 정의합니다.

| Agent Name | Role | Description |
|------------|------|-------------|
| code-review | 코드 리뷰 | PR 전 코드 품질 자동 체크 |
| security-guidance | 보안 가이드 | 보안 취약점 사전 방지 |
| pr-review-toolkit | PR 리뷰 | 이슈 연결 및 PR 리뷰 자동화 |

---

## Pages

| 페이지 | 경로 (예상) | 설명 |
|--------|-------------|------|
| 로그인 | `/login` | 로그인/회원가입 화면 |
| 인게임 | `/game` | 메인 게임 플레이 화면 |
| 새 선택 | `/birds` | 캐릭터 선택 및 구매 화면 |
| 랭킹 | `/ranking` | 친구 랭킹 조회 화면 |
| 홈 | `/` | 메인 메뉴 (로그인 후) |

---

## KEY FEATURES

프로젝트의 핵심 기능 및 특징을 설명합니다.

### Feature 1: 로그인 시스템
- 설명: 사용자 이름/비밀번호 기반 로그인 + 카카오 ID 연동
- 관련 파일: TBD
- 세부 기능:
  - 일반 로그인 (이름 + 비밀번호)
  - 카카오 소셜 로그인
  - 자동 로그인 (토큰 저장)

### Feature 2: 인게임 플레이
- 설명: Flappy Bird 스타일의 메인 게임 플레이
- 관련 파일: TBD
- 세부 기능:
  - 새(캐릭터) 조작 (탭/클릭으로 점프)
  - 파이프 장애물 생성 및 충돌 감지
  - 실시간 점수 표시
  - 게임 오버 처리

### Feature 3: 새(캐릭터) 선택 시스템
- 설명: 등급별 캐릭터 수집 및 선택
- 관련 파일: TBD
- 등급 체계:
  | 등급 | 설명 | 가격 |
  |------|------|------|
  | COMMON | 기본 새 | 낮음 |
  | RARE | 희귀 새 | 중간 |
  | EPIC | 특별한 새 | 높음 |
  | UNIQUE | 프리미엄 비행체 | 최고 |

### Feature 4: 랭킹 시스템
- 설명: 카카오톡 친구 기반 순위 시스템
- 관련 파일: TBD
- 세부 기능:
  - 카카오 친구 목록 연동
  - 친구들 간 점수 비교
  - 주간/전체 랭킹

### 디자인 컨셉
- **자연 친화적 분위기**: 숲, 하늘, 자연 배경
- **현대적 UI**: 깔끔하고 세련된 인터페이스
- **강렬한 장애물**: 기존보다 임팩트 있는 파이프 디자인

---

## Project Structure

```
FLAPPY-BIRD/
├── .github/                    # GitHub 템플릿
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── src/                        # 소스 코드 (TBD)
│   ├── components/             # UI 컴포넌트
│   ├── screens/                # 페이지/화면
│   │   ├── Login/
│   │   ├── Game/
│   │   ├── BirdSelection/
│   │   └── Ranking/
│   ├── assets/                 # 이미지, 사운드 등
│   ├── services/               # API, 인증 등
│   └── utils/                  # 유틸리티 함수
├── .gitignore
├── CLAUDE.md                   # 프로젝트 문서
└── README.md                   # (예정)
```

> 실제 구조는 기술 스택 결정 후 확정

---

## Commands

```bash
# 설치

# 실행

# 테스트

# 빌드

```

---

## Workflow

### Branch Strategy

```
main (production)
 └── dev (development)
      ├── feature/login
      ├── feature/game
      ├── feature/bird-selection
      └── feature/ranking
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

### 외부 연동
- 카카오 개발자 계정 필요 (로그인 + 친구 목록 API)
- 카카오 앱 등록 필요

### 고려 사항
- 모바일 우선 개발 (터치 인터페이스)
- 오프라인 플레이 지원 여부 결정 필요
- 인앱 결제 (새 구매) 구현 방식 결정 필요
