import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const DEFAULT_API_URL = 'http://localhost:4000';
const DEFAULT_S3_ENDPOINT = 'http://localhost:9000';
const API_URL = process.env.API_URL ?? DEFAULT_API_URL;

/**
 * Origin only (scheme + host + port) for CSP img-src / connect-src.
 * Production must set S3_ENDPOINT to the Cloudflare R2 endpoint so browser
 * PUTs to presigned URLs and venue plan image loads are allowed.
 */
function resolveS3Origin(): string {
  const endpoint = process.env.S3_ENDPOINT ?? DEFAULT_S3_ENDPOINT;
  try {
    return new URL(endpoint).origin;
  } catch {
    return DEFAULT_S3_ENDPOINT;
  }
}

const S3_ORIGIN = resolveS3Origin();

/**
 * Baseline CSP for BOS web.
 * script-src / style-src keep 'unsafe-inline' for Next.js inline bootstrapping.
 * No 'unsafe-eval' — production `next start` (e2e) works without it; do not add
 * unless a future Next.js / Turbopack requirement forces a documented exception.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${S3_ORIGIN}`,
  `connect-src 'self' ${S3_ORIGIN}`,
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
