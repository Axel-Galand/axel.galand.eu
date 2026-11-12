import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Static pages cannot carry a nonce, hence 'unsafe-inline' for Next's inline scripts. Dev needs
// 'unsafe-eval' for React Refresh, so the policy only applies to production builds.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://res.cloudinary.com",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  // The CV reads its font files at runtime: copy them into the standalone image.
  outputFileTracingIncludes: {
    '/[locale]/cv.pdf': ['./src/lib/cv/fonts/*.woff'],
  },
  experimental: {
    // Pages for unknown slugs are cached too (as 404s): kept in Next's bounded in-memory cache,
    // bots requesting random URLs cannot fill the disk. The cache restarts empty on each deploy.
    isrFlushToDisk: false,
  },
  poweredByHeader: false,
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  headers: async () => [
    { source: '/:path*', headers: securityHeaders },
    // The admin keeps Payload's own needs: the policy only covers the public site.
    ...(process.env.NODE_ENV === 'production'
      ? [
          {
            // HTML pages only: the CV, feeds and sitemap are not documents to protect.
            source: '/((?!admin|api|_next|next|.*\\.(?:pdf|xml|txt)$).*)',
            headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }],
          },
        ]
      : []),
  ],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
