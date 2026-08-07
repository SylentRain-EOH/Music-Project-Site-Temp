import type { NextConfig } from "next";

const apiProxyTarget = (process.env.API_PROXY_TARGET ?? "http://localhost:8000").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${apiProxyTarget}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
