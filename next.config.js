/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/download/:platform', destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:4000'}/download/:platform` },
      // The packaged desktop app (desktop-electron/) is built to load these
      // .html paths — see README.md. The app router serves them without the
      // suffix, so map the legacy .html URLs onto the real routes.
      { source: '/session-type.html', destination: '/session-type' },
      { source: '/launch.html', destination: '/launch' },
      { source: '/overlay.html', destination: '/overlay' },
    ];
  },
};

module.exports = nextConfig;
