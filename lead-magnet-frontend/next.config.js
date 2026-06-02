/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

module.exports = nextConfig;
