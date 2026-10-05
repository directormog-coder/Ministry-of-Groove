import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['/data/data/**', 'node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
