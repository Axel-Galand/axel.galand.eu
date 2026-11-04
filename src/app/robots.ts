import type { MetadataRoute } from 'next'

import { isIndexable } from '@/lib/seo/indexing'
import { absoluteURL } from '@/lib/urls'

// Read at runtime, like the X-Robots-Tag header: flipping SITE_INDEXABLE needs no rebuild here.
export const dynamic = 'force-dynamic'

// Crawling stays allowed while the site is noindex: a Disallow would hide the noindex from
// crawlers, and LinkedIn would stop building link previews.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(isIndexable() ? { sitemap: absoluteURL('/sitemap.xml') } : {}),
  }
}
