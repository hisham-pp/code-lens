/** @type {import('next').NextConfig} */
const isExport = process.env.DOCS_OUTPUT === 'export';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@code-lense/core', '@code-lense/sdk'],
  ...(isExport
    ? {
        output: 'export',
        basePath: process.env.BASE_PATH || '',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
