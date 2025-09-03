/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated experimental.appDir. Add other valid config options below if needed.
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
