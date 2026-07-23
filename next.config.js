const withNextIntl = require("next-intl/plugin")();
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/zh",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/zh/login",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
