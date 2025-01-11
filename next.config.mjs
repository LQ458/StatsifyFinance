import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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

export default withNextIntl(nextConfig);
