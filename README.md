# Flappy Bird

Flappy Bird 스타일의 캐주얼 모바일 게임 앱

> **Live Demo:** https://flappy-bird-nyey.vercel.app/

## Features

- **게임 모드** — Record Mode (최고 점수 도전) / Stage Mode (스테이지 클리어)
- **8개 스테이지** — 초원, 숲길, 동굴(텔레포트), 심연, 역장(중력 반전), 혼돈, 가속(스피드 링), 질주
- **가챠 시스템** — 37종 새 수집 (Common / Rare / Epic / Unique)
- **계절 테마** — 봄, 여름, 가을, 겨울 배경
- **인게임 아이템** — Break(파이프 파괴), Wraith(무적), Point(보너스)

## Tech Stack

| Category | Stack |
|----------|-------|
| Frontend | Next.js 16, React 18, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + REST API) |
| Deploy | Vercel (Web), Capacitor (Android — 예정) |

## Getting Started

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build
```

## Project Structure

```
app/          — Next.js App Router (페이지 라우팅)
components/   — UI 컴포넌트 (게임 화면, 홈, 새 선택 등)
lib/          — 비즈니스 로직 (Supabase 서비스, Context, 스테이지 데이터)
types/        — TypeScript 타입 정의
supabase/     — DB 마이그레이션
public/       — 정적 리소스 (새 이미지)
```
