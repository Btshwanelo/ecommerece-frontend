import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Object storage (file server)
      {
        protocol: "http",
        hostname:
          process.env.NEXT_PUBLIC_OBJECT_STORAGE_HOSTNAME || "109.199.122.35",
        port: process.env.NEXT_PUBLIC_OBJECT_STORAGE_PORT || "4000",
        pathname: "/file/**",
      },
      // Backend API (for images or CMS uploads)
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME || "109.199.122.35",
        port: process.env.NEXT_PUBLIC_API_PORT || "5000",
        pathname: "/**",
      },
      // Allow https for production CDN or external images
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_PAYFAST_MERCHANT_ID:
      process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID,
    NEXT_PUBLIC_PAYFAST_MERCHANT_KEY:
      process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY,
    NEXT_PUBLIC_PAYFAST_PASSPHRASE: process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE,
    NEXT_PUBLIC_PAYFAST_SANDBOX: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX,
  },

  // Fix Next.js file tracing lockfile warnings
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
