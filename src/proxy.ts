import { NextResponse, type NextRequest } from 'next/server'

import { isFirstUserRouteBlocked } from '@/lib/security/firstUser'
import { isIndexable, NOINDEX_DIRECTIVES } from '@/lib/seo/indexing'

// The MCP plugin's key collection also enables Payload's API-key auth, so an MCP key would work on
// the REST API as `payload-mcp-api-keys API-Key <key>`. MCP itself uses `Bearer`: refuse that form.
const isMcpKeyAsRestKey = (request: NextRequest) =>
  request.headers.get('authorization')?.trim().toLowerCase().startsWith('payload-mcp-api-keys ') ??
  false

// Runs on every request, so these checks follow the runtime env even on pages prerendered at build.
export function proxy(request: NextRequest) {
  const response = isMcpKeyAsRestKey(request)
    ? new NextResponse('Unauthorized', { status: 401 })
    : isFirstUserRouteBlocked(request.nextUrl.pathname)
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
