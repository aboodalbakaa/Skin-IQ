import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tnntryefsskmhezkobxr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
