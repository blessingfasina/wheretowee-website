/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Use modern image formats
    formats: ['image/avif', 'image/webp'],
    // Minimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Reduce JavaScript bundle size
  swcMinify: true,
  
  // Optimize production builds
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimize package imports (reduces bundle size)
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  async redirects() {
    return [
      // Redirect www.wheretowee.uk to wheretowee.uk (canonical)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wheretowee.uk',
          },
        ],
        destination: 'https://wheretowee.uk/:path*',
        permanent: true,
      },
      // Redirect .co.uk to .uk (canonical)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wheretowee.co.uk',
          },
        ],
        destination: 'https://wheretowee.uk/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wheretowee.co.uk',
          },
        ],
        destination: 'https://wheretowee.uk/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

