import type { MetadataRoute } from 'next'

// Crawling stays allowed while the site is noindex: a Disallow would hide the noindex from
// crawlers, and LinkedIn would stop building link previews.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
  }
}
