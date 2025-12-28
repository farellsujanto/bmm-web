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
  // SEO optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  // Ensure proper redirects for SEO
  async redirects() {
    return [
      // Add any necessary redirects here
    ];
  },
  // Generate metadata for static export
  generateBuildId: async () => {
    // Use timestamp or version for cache busting
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
