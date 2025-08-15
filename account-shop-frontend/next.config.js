/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint checks during build for production
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Production optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'dinhquocviet.space', 'api.dinhquocviet.space'],
    unoptimized: true, // For static export if needed
  },
  
  // Output configuration
  output: 'standalone', // For Docker/PM2 deployment
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'account-shop-production',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
