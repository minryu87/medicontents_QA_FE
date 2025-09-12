# 1. 의존성 설치 및 빌드
FROM node:18-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드 시)
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NODE_ENV=production

# 애플리케이션 빌드
RUN npm run build

# 2. 프로덕션 이미지 생성
FROM node:18-alpine AS runner

WORKDIR /app

# 보안을 위한 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 단계에서 생성된 파일들 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 사용자 권한 설정
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]
