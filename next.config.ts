import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oqecxzcnpceqxvsylhcp.supabase.co",
        pathname: "/storage/v1/object/public/memorial-portraits/**",
      },
    ],
  },
};

export default nextConfig;
