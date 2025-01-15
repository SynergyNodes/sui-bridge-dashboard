/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/metrics',
        destination: 'http://103.241.50.69:9184/metrics',
      },
    ];
  },
}

module.exports = nextConfig
