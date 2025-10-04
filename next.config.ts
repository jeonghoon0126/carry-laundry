import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Note: No assetPrefix or basePath configured to ensure static assets work correctly
  // If rewrites() are added in the future, include this rule at the top:
  // { source: '/_next/:path*', destination: '/_next/:path*' }
}

export default nextConfig