import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Configuración para servir archivos estáticos desde public/uploads
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
