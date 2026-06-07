/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-auth"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "macfalcon.com"],
    },
  },
};

module.exports = nextConfig;
