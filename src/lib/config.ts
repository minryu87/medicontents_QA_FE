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
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const config = {
  apiUrl: getApiUrl(),
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Medicontents QA',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
