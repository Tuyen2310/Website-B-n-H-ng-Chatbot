import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ['smartshop.local', 'smartshop.local:3000'],
  
  // Cho phép Next.js tự động tối ưu hóa ảnh (resize, WebP/AVIF conversion)
  images: {
    unoptimized: false, // Bật tối ưu hóa ảnh
    formats: ['image/avif', 'image/webp'], // Ưu tiên format nhẻ nhất
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache ảnh 7 ngày
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'smartshop.local',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'smartshop.local',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'smartshop.local',
        port: '3001',
      },
    ],
  },

  // Bật Server Component external packages để bundle nhỏ hơn
  serverExternalPackages: [],

  // Tương thích PWA
  async headers() {
    return [
      {
        // Cache tĩnh các file JS, CSS, font 1 năm (immutable)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache ảnh tự động tối ưu hóa của Next.js 7 ngày
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL.slice(0, -4) : process.env.NEXT_PUBLIC_API_URL) : 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
