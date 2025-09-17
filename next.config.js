/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'medicontents-qa-be-u45006.vm.elestio.app',
      'medicontents-qa-fe-u45006.vm.elestio.app',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://medicontents-qa-be-u45006.vm.elestio.app'
      : 'http://localhost:8000',
    NEXT_PUBLIC_APP_NAME: 'Medicontents QA',
  },
  async rewrites() {
    // 프로덕션 환경에서만 rewrites 사용
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `https://medicontents-qa-be-u45006.vm.elestio.app/api/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;