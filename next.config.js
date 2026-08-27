/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/download/:platform', destination: `${process.env.BACKEND_URL || 'http://localhost:4000'}/download/:platform` },
    ];
  },
};

module.exports = nextConfig;
