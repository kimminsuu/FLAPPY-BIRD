# KEY FEATURES

프로젝트의 핵심 기능 및 특징을 설명합니다.

---

## Feature 1: 닉네임 설정 (로그인)

- **설명**: 기기 UUID 기반 식별 + 닉네임 설정
- **관련 파일**: `components/login-page.tsx`, `lib/device.ts`, `lib/user-service.ts`
- **세부 기능**:
  - 첫 실행 시 닉네임 입력 화면 표시
  - 닉네임 중복 확인 (Supabase DB 조회)
  - 기기 UUID 자동 생성 + localStorage 영구 보관
  - 닉네임 + 기기 UUID로 Supabase에 유저 생성
  - 재실행 시 기기 UUID로 자동 식별 → 홈 화면 진입
  - 닉네임 변경 기능 (홈 화면 모달)
- **구현 상태**: 완료 (Supabase DB 연동)

---

## Feature 1.5: 홈 화면

- **설명**: 메인 메뉴 화면
- **관련 파일**: `components/home-page.tsx`, `app/home/page.tsx`
- **세부 기능**:
  - START 버튼 (모드 선택 화면으로 이동)
  - SELECT BIRD 버튼 (캐릭터 선택/가챠)
  - EXIT 버튼
  - 닉네임 변경 모달 (연필 아이콘 클릭)
  - 장착된 새 이미지 표시
  - UserInfoBar (닉네임 + 코인 잔액)
  - 비인증 상태 접근 시 로그인 페이지 리다이렉트
- **구현 상태**: 완료

---

## Feature 1.6: 모드 선택 화면

- **설명**: 게임 모드를 선택하는 화면 (RECORD MODE / STAGE MODE)
- **관련 파일**: `components/mode-selection-page.tsx`, `app/mode-select/page.tsx`
- **세부 기능**:
  - RECORD MODE 선택 → 기존 게임 (`/game`)
  - STAGE MODE 선택 → 스테이지 선택 화면 (`/stage-select`)
  - 뒤로가기 → 홈 화면 (`/home`)
  - 계절 배경 테마 적용
- **구현 상태**: 완료

---

## Feature 1.7: 스테이지 선택 화면

- **설명**: STAGE MODE에서 플레이할 스테이지를 선택하는 화면
- **관련 파일**: `components/stage-select-page.tsx`, `app/stage-select/page.tsx`
- **세부 기능**:
  - 3행 x 5열 격자 레이아웃 (총 15스테이지)
  - 잠금/오픈 상태 표시 (이전 스테이지 100% 클리어 시 해제)
  - 최고 기록 (%) 표시
  - 계절별 카드 스타일 적용
  - 스테이지 기록 Supabase DB에서 로드
- **구현 상태**: 완료

---

## Feature 1.8: 스테이지 모드 게임플레이

- **설명**: 미리 설계된 파이프 배치를 가진 스테이지별 게임
- **관련 파일**: `components/game-page.tsx`, `lib/stages.ts`, `types/stage.ts`
- **세부 기능**:
  - 스테이지별 파이프 배치 (gapY, gapHeight, spacing)
  - 점수 기반 진행률 HUD (10% 단위)
  - 스테이지 클리어 모달 (100%, 코인 보상, Next 버튼)
  - 최고 기록 Supabase DB 저장
- **스테이지 목록**:
  - Stage 1 "초원": 15파이프, 넓은 간격, 입문용
  - Stage 2 "숲길": 25파이프, 간격/갭 점진 감소
  - Stage 3 "동굴": 25파이프, 텔레포트 기믹 (IN/OUT 포탈 + 닫히는 파이프)
  - Stage 4 "심연": 30파이프, 텔레포트 10개 연속, 좁은 갭/간격
  - Stage 5 "역장": 30파이프, 중력 반전 존 4개
  - Stage 6 "혼돈": 25파이프, 텔레포트 + 중력 반전 혼합 (3개 존)
  - Stage 7 "가속": Speed Ring 기믹 (Slow/Fast 링, 속도 변화)
  - Stage 8 "질주": Speed Ring 고밀도
- **텔레포트 기믹** (Stage 3~):
  - IN 포탈 진입 → 새 사라짐 (물리/충돌/탭 중지)
  - 막힌 파이프 자동 통과 + 점수 반영
  - OUT 포탈에서 재등장 (velocity=0)
  - 포탈: 노란색 도넛 링 + 소용돌이 + 흡입/방출 파티클
  - 파이프 닫히는 애니메이션 (열린 상태 → 점진적 폐쇄)
- **중력 반전 기믹** (Stage 5~):
  - reverseGravity: true 파이프 ~ false 파이프 사이에 반전 존 생성
  - 존 안에서 중력 방향 반전 (탭하면 아래로, 자연 상승)
  - 보라색 경계선 + 존 내부 시각 이펙트
  - Stage 6: 반전 존 안에서 텔레포트 동시 사용
- **Speed Ring 기믹** (Stage 7~):
  - Slow Ring (연두색): 파이프 속도 감소
  - Fast Ring (빨간색): 파이프 속도 증가
  - 효과 지속 시간 + HUD 카운트다운 표시
  - 거리 기반 파이프 스폰 (속도 변화에도 간격 일정)

---

## Feature 2: 인게임 플레이

- **설명**: Flappy Bird 스타일의 메인 게임 플레이
- **관련 파일**: `components/game-page.tsx`, `types/game.ts`
- **세부 기능**:
  - 새(캐릭터) 조작 (탭/클릭으로 점프)
  - 파이프 장애물 생성 및 충돌 감지
  - 실시간 점수 표시
  - 게임 오버 처리
  - 3D 파이프 렌더링 + 계절 테마 색상
  - 등급별 아이템 시스템 (break, wraith, point)
  - 코인 보상 시스템 (Supabase DB 저장)
  - 최고 점수 갱신 (Supabase DB)

---

## Feature 3: 새(캐릭터) 뽑기 시스템

- **설명**: 코인으로 랜덤 뽑기를 통해 새 캐릭터 획득
- **관련 파일**: `components/bird-selection-page.tsx`, `types/bird.ts`, `lib/birds.ts`

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

| 등급 | 색상 | HEX |
|------|------|-----|
| COMMON | Gray | #6B7280 |
| RARE | Blue | #3B82F6 |
| EPIC | Purple | #8B5CF6 |
| UNIQUE | Gold | #F59E0B |

### 가챠 UI
- 뽑기 애니메이션 (1.5초): 카드 뒷면 + 빛나는 효과
- 결과 카드: 등급 색상 테두리 + NEW!/중복 배지
- "확인" / "한 번 더!" 버튼
- 코인 차감/환급 실시간 반영

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

### 이미지 경로

```
images/birds/
├── common/    # COMMON 등급
├── rare/      # RARE 등급
├── epic/      # EPIC 등급
└── unique/    # UNIQUE 등급
```

- **구현 상태**: 완료 (Supabase DB 연동)

---

## Feature 4: 계절 테마 시스템

- **설명**: 사용자가 선택 가능한 계절별 배경 테마 (전역 적용)
- **관련 파일**: `components/ui/SeasonalBackground.tsx`, `components/ui/SeasonSelector.tsx`, `lib/season-context.tsx`
- **구현 방식**: React Context (`SeasonProvider`) + Supabase DB 저장 (localStorage fallback)
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
