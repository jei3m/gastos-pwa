import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  turbopack: {},
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

const isDev = process.env.NODE_ENV === 'development';

export default withPWA({
  dest: 'public',
  disable: isDev,
  workboxOptions: {
    mode: 'production',   // disables workbox logging
  },
})(nextConfig);
