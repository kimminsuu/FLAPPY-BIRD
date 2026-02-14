# KEY FEATURES

프로젝트의 핵심 기능 및 특징을 설명합니다.

---

## Feature 1: 로그인 시스템

- **설명**: 사용자 이름/비밀번호 기반 로그인
- **관련 파일**: `components/login-page.tsx`
- **세부 기능**:
  - 일반 로그인 (이름 + 비밀번호) ✅
  - 자동 로그인 (토큰 저장) - 예정
  - master 계정 로그인 (`admin` / `admin1!`) ✅
  - 로그인 성공 시 `/home` 라우팅 ✅
  - 인증 정보 localStorage 저장 ✅
- **구현 상태**: 기본 로그인 플로우 완료, DB 연동 대기
- **향후 계획**:
  - 새 유저 생성 시 ERD 기반 user insert
  - 기존 user 존재 시 handling

---

## Feature 1.5: 홈 화면

- **설명**: 로그인 후 메인 메뉴 화면
- **관련 파일**: `components/home-page.tsx`, `app/home/page.tsx`
- **세부 기능**:
  - START 버튼 (모드 선택 화면으로 이동) ✅
  - SELECT BIRD 버튼 (캐릭터 선택) ✅
  - ~~RANKING 버튼~~ (제거됨)
  - EXIT 버튼 ✅
  - 로그아웃 버튼 + 확인 모달 ✅
  - 비인증 상태 접근 시 로그인 페이지 리다이렉트 ✅
- **구현 상태**: UI 완료, 각 버튼 라우팅 연결 예정

---

## Feature 1.6: 모드 선택 화면

- **설명**: 게임 모드를 선택하는 화면 (RECORD MODE / STAGE MODE)
- **관련 파일**: `components/mode-selection-page.tsx`, `app/mode-select/page.tsx`
- **세부 기능**:
  - RECORD MODE 선택 → 기존 게임 (`/game`) ✅
  - STAGE MODE 선택 → 스테이지 선택 화면 (`/stage-select`) ✅
  - 뒤로가기 → 홈 화면 (`/home`) ✅
  - 계절 배경 테마 적용 ✅
- **구현 상태**: UI 완료

---

## Feature 1.7: 스테이지 선택 화면

- **설명**: STAGE MODE에서 플레이할 스테이지를 선택하는 화면
- **관련 파일**: `components/stage-select-page.tsx`, `app/stage-select/page.tsx`
- **세부 기능**:
  - 3행 x 5열 격자 레이아웃 (총 15스테이지) ✅
  - Stage 1~5: 오픈 상태 (색상 그라데이션, 클릭 가능) ✅
  - Stage 6~15: 잠금 상태 (회색 배경 + Lock 아이콘 + 반투명 오버레이) ✅
  - 뒤로가기 → 모드 선택 화면 (`/mode-select`) ✅
  - 계절 배경 테마 적용 ✅
  - 인증 가드 (비로그인 시 리다이렉트) ✅
- **구현 상태**: UI 완료, 게임 연동 대기
- **향후 계획**:
  - 스테이지 클릭 시 해당 스테이지 게임 시작
  - 스테이지 클리어 시 다음 스테이지 잠금 해제
  - 스테이지별 난이도 / 보상 설정

---

## Feature 2: 인게임 플레이

- **설명**: Flappy Bird 스타일의 메인 게임 플레이
- **관련 파일**: TBD
- **세부 기능**:
  - 새(캐릭터) 조작 (탭/클릭으로 점프)
  - 파이프 장애물 생성 및 충돌 감지
  - 실시간 점수 표시
  - 게임 오버 처리

---

## Feature 3: 새(캐릭터) 뽑기 시스템

- **설명**: 코인으로 랜덤 뽑기를 통해 새 캐릭터 획득
- **관련 파일**: `types/bird.ts`, `lib/birds.ts`

### 뽑기 시스템 (가챠)

| 항목 | 값 |
|------|-----|
| 1회 뽑기 비용 | **100코인** |
| 중복 시 환급 | **50코인** (50%) |

### 등급별 확률

| 등급 | 확률 |
|------|------|
| COMMON | 70% |
| RARE | 20% |
| EPIC | 7% |
| UNIQUE | 3% |

### 등급별 UI 색상

카드 테두리, 배지, 이펙트 등에 사용

| 등급 | 색상 | HEX |
|------|------|-----|
| COMMON | Gray | #6B7280 |
| RARE | Blue | #3B82F6 |
| EPIC | Purple | #8B5CF6 |
| UNIQUE | Gold | #F59E0B |

### 새 ID 규칙

- 형식: `bird_{rarity}_{number}`
- 예시: `bird_common_1`, `bird_epic_3`

### 현재 등록된 새

| 등급 | 수량 | 비고 |
|------|------|------|
| COMMON | 10마리 | bird_common_1은 기본 보유, 색상 테마 |
| RARE | 9마리 | 재질/속성 테마 |
| EPIC | 9마리 | 동물 테마 |
| UNIQUE | 9마리 | 탈것 테마 |

### 이미지 처리

- `bird_common_1`: FlappyBird SVG 컴포넌트 (`imagePath: "svg"`)
- 그 외 모든 새: 개별 PNG 파일 (`bird_{rarity}_{number}.png`)

#### 이미지 규격 (모든 등급 공통)

| 항목 | 값 |
|------|-----|
| 캔버스 크기 | **160x110px** |
| 배경 | **투명 (PNG alpha)** |
| 새 정렬 | **가운데 정렬** |
| 새 크기/여백 | `bird_common_2.png` 기준 |

#### 이미지 업로드 시 처리 순서

1. 배경이 투명한지 검증 (불투명 시 사용자에게 확인)
2. 새의 바운딩 박스 추출
3. `bird_common_2.png` 기준 크기로 스케일 (비율 유지)
4. 160x110 투명 캔버스에 가운데 배치

### 이미지 경로

```
images/birds/
├── common/    # COMMON 등급
├── rare/      # RARE 등급
├── epic/      # EPIC 등급
└── unique/    # UNIQUE 등급
```

- **구현 상태**: 타입/로직 완료, UI 구현 예정

---

## Feature 4: 계절 테마 시스템

- **설명**: 사용자가 선택 가능한 계절별 배경 테마 (전역 적용)
- **관련 파일**: `components/ui/SeasonalBackground.tsx`, `components/ui/SeasonSelector.tsx`, `lib/season-context.tsx`
- **구현 방식**: React Context (`SeasonProvider`) + localStorage 영속화
- **적용 범위**: 모든 화면에서 동일한 계절 테마 공유

### 테마 종류

| 계절 | 하늘 | 잔디 | 장식 |
|------|------|------|------|
| 봄 | 연한 하늘빛 | 연두색 | 벚꽃잎 |
| 여름 | 청량한 파랑 | 진초록 | - |
| 가을 | 노을빛 | 갈색 | 낙엽 |
| 겨울 | 연한 회색빛 | 흰색(눈) | 눈송이 |

- **구현 상태**: 완료

---

## 디자인 컨셉

- **자연 친화적 분위기**: 숲, 하늘, 자연 배경 + 계절 테마
- **현대적 UI**: 깔끔하고 세련된 인터페이스
- **강렬한 장애물**: 기존보다 임팩트 있는 파이프 디자인
