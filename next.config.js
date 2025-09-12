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
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_APP_NAME: 'Medicontents QA',
  },
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://medicontents-qa-be-u45006.vm.elestio.app'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;