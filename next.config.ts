import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'cnbl-cdn.bamgrid.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
    // Permite qualquer domínio para desenvolvimento (remove em produção)
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
