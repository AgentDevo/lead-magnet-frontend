import type { NextConfig } from 'next';

/**
 * Simplified Next.js configuration.
 * Enables React strict mode and compression middleware.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @ts-ignore – next-compression adds a custom field.
  compress: true,
};

export default nextConfig;
