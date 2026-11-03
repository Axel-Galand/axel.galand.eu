import { NextResponse } from 'next/server'

import { isIndexable, NOINDEX_DIRECTIVES } from '@/lib/seo/indexing'

// Runs on every request, so the header follows the runtime env even on pages prerendered at build.
export function proxy() {
  const response = NextResponse.next()

  if (!isIndexable()) {
    response.headers.set('X-Robots-Tag', NOINDEX_DIRECTIVES)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
