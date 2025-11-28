import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ubixkxrftezweuqbbvch.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**', // optional but more secure
      },
    ],
    // If you have other domains (e.g. old *.supabase.co, avatars, etc.)
    // domains: ['example.com'], // deprecated in Next.js 13+, use remotePatterns instead
  },
};

export default nextConfig;
