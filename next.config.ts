import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Explicitly whitelist which env vars are exposed to the browser.
   * Only NEXT_PUBLIC_ vars should reach the client.
   * SUPABASE_SERVICE_ROLE_KEY and other secrets NEVER appear here.
   */
  env: {
    // Server-only — do NOT add SUPABASE_SERVICE_ROLE_KEY here
  },

  /**
   * Security headers
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} wss:`,
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
