/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // recommended for best practices
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
