/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'ecommerce-backend.onrender.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecommerce-backend.onrender.com',
        port: '',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/uploads/**',
      },
    ],
  },
  // Disable image optimization for Render free tier
  output: 'standalone',
}

module.exports = nextConfig
