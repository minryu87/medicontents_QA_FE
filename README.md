# Medicontents QA Frontend

의료 콘텐츠 생성 및 관리 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI Components
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📁 프로젝트 구조

```
medicontents_QA_FE/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── admin/              # 어드민 페이지
│   │   ├── client/             # 클라이언트 페이지
│   │   └── layout.tsx          # 루트 레이아웃
│   ├── components/             # 재사용 컴포넌트
│   │   └── ui/                 # 기본 UI 컴포넌트
│   ├── lib/                    # 유틸리티 라이브러리
│   ├── services/               # API 서비스
│   └── types/                  # TypeScript 타입 정의
├── public/                     # 정적 파일
├── Dockerfile                  # Docker 설정
├── next.config.js              # Next.js 설정
└── package.json                # 프로젝트 의존성
```

## 🛠️ 설치 및 실행

### 1. 환경 설정

```bash
# 저장소 클론
git clone https://github.com/minryu87/medicontents_QA_FE.git
cd medicontents_QA_FE

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

```bash
# .env.local 파일 생성
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 3. 개발 서버 실행

```bash
# 개발 모드로 실행
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📚 주요 기능

### 어드민 패널 (`/admin`)
- 대시보드 및 통계 (실제 파이프라인 결과 표시)
- 포스트 관리 (목록, 상세, 파이프라인 결과)
- 에이전트 모니터링 (실행 상태, 성능 통계)
- 캠페인 관리

### 클라이언트 패널 (`/client`)
- 병원별 포스트 현황
- 포스트 생성 및 자료 제공
- AI 생성 콘텐츠 검토 및 승인
- 캠페인 현황 및 프로필 관리

### 실제 데이터 연동
- PostgreSQL 데이터베이스 연동
- Redis 캐시 시스템 연동
- 실제 AI 파이프라인 결과 표시
- 실시간 에이전트 모니터링

## 🔧 API 연동

백엔드 API와 완전히 연동되어 실제 데이터만 표시합니다:

- 실제 포스트 데이터 (10개)
- 실제 파이프라인 결과 (품질 점수 100.0)
- 실제 에이전트 실행 통계
- 실제 병원 및 캠페인 데이터

## 🚀 배포

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t medicontents-qa-frontend .

# Docker 컨테이너 실행
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend-url medicontents-qa-frontend
```

### 환경 변수

- `NEXT_PUBLIC_API_URL`: 백엔드 API URL
- `NEXT_PUBLIC_APP_NAME`: 애플리케이션 이름

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.