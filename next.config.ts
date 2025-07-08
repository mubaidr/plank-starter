import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      }

      // Force Konva to use browser version (avoids 'canvas' import)
      config.resolve.alias = {
        ...config.resolve.alias,
        'konva': 'konva/lib/index.js',
      }
    }

    return config
  },
};

export default nextConfig;
