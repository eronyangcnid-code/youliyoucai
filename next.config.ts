import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow RSS parsing from server components
  serverExternalPackages: ['rss-parser'],
}

export default nextConfig
