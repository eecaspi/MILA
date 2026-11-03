import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Logos and offer images uploaded from the back office (Supabase Storage, public bucket).
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    // Image uploads go through server actions (bucket limit is 5MB).
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
