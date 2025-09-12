/**
 * 애플리케이션 설정
 */

// 환경별 API URL 설정
const getApiUrl = (): string => {
  // 프로덕션 환경에서는 항상 프로덕션 API URL 사용
  if (process.env.NODE_ENV === 'production') {
    return 'https://medicontents-qa-be-u45006.vm.elestio.app';
  }

  // 개발 환경에서는 환경 변수 또는 기본값 사용
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('🔍 Config Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: envApiUrl,
    finalUrl: envApiUrl || 'http://localhost:8000'
  });

  return envApiUrl || 'http://localhost:8000';
};

const apiUrl = getApiUrl();

export const config = {
  apiUrl,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Medicontents QA',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// 브라우저 콘솔에서 확인 가능하도록 전역 변수 설정
if (typeof window !== 'undefined') {
  (window as any).MEDICONTENTS_CONFIG = config;
}

export default config;
