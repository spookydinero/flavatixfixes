/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['kobuclkvlacdwvxmakvq.supabase.co']
  }
}

module.exports = nextConfig