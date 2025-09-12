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
    NEXT_PUBLIC_API_URL: 'https://medicontents-qa-be-u45006.vm.elestio.app',
    NEXT_PUBLIC_APP_NAME: 'Medicontents QA',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://medicontents-qa-be-u45006.vm.elestio.app/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;