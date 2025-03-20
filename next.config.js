const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
