import { NextResponse, type NextRequest } from 'next/server'

import { isFirstUserRouteBlocked } from '@/lib/security/firstUser'
import { isIndexable, NOINDEX_DIRECTIVES } from '@/lib/seo/indexing'

// Runs on every request, so both checks follow the runtime env even on pages prerendered at build.
export function proxy(request: NextRequest) {
  const response = isFirstUserRouteBlocked(request.nextUrl.pathname)
    ? new NextResponse('Not Found', { status: 404 })
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
