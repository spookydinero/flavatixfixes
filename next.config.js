/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'export', // Commented out for development to allow API routes
  // trailingSlash: true,

  images: {
    domains: ['kobuclkvlacdwvxmakvq.supabase.co'],
    unoptimized: true
  },

  async redirects() {
    return [
      {
        source: '/review',
        destination: '/social',
        permanent: true,
      },
      {
        source: '/history',
        destination: '/flavor-wheels',
        permanent: true,
      },
    ]
  },

}

module.exports = nextConfig