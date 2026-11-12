import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { isFirstUserRouteBlocked } from '@/lib/security/firstUser'
import { isIndexable, NOINDEX_DIRECTIVES } from '@/lib/seo/indexing'

// The MCP plugin's key collection also enables Payload's API-key auth, so an MCP key would work on
// the REST API as `payload-mcp-api-keys API-Key <key>`. MCP itself uses `Bearer`: refuse that form.
const isMcpKeyAsRestKey = (request: NextRequest) =>
  request.headers.get('authorization')?.trim().toLowerCase().startsWith('payload-mcp-api-keys ') ??
  false

// Everything else is the public site, which next-intl rewrites under /fr or /en: it must never
// see these, or the healthcheck and the admin would land on a 404.
const outsideSite = /^\/(?:admin|api|next|_next|__next|healthz)(?:\/|$)/
const outsideSiteFiles = new Set(['/robots.txt', '/sitemap.xml', '/favicon.ico', '/icon.svg'])

export const isPublicPath = (pathname: string): boolean =>
  !outsideSite.test(pathname) && !outsideSiteFiles.has(pathname)

// The browser language only picks the home page, and only for visitors arriving from elsewhere:
// a shared link to a French-only page must not send an English browser to its missing /en twin,
// and the language switch (a same-origin link to `/`) must not be overridden. Browsers without
// Sec-Fetch-Site (Safari before 16.4) still get the detection there.
const i18nHome = createMiddleware(routing)
const i18n = createMiddleware({ ...routing, localeDetection: false })

// In production, Next runs the proxy a second time on the path next-intl rewrote to (`/fr/...`),
// which next-intl would redirect back to `/...`: a redirect loop. Its header marks that pass.
export const isRewrittenByI18n = (request: NextRequest): boolean =>
  request.headers.has('x-next-intl-locale')

const detectsLanguage = (request: NextRequest): boolean =>
  request.nextUrl.pathname === '/' && request.headers.get('sec-fetch-site') !== 'same-origin'

// Runs on every request, so these checks follow the runtime env even on pages prerendered at build.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = isMcpKeyAsRestKey(request)
    ? new NextResponse('Unauthorized', { status: 401 })
    : isFirstUserRouteBlocked(pathname)
      ? new NextResponse('Not Found', { status: 404 })
      : isPublicPath(pathname) && !isRewrittenByI18n(request)
        ? (detectsLanguage(request) ? i18nHome : i18n)(request)
        : NextResponse.next()

  if (!isIndexable()) {
    response.headers.set('X-Robots-Tag', NOINDEX_DIRECTIVES)
  }

  return response
}

export const config = {
  // _next/image stays matched so optimized images carry the noindex header too.
  matcher: ['/((?!_next/static).*)'],
}
