import { getTranslations } from 'next-intl/server'

import { isLocale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
import { documentPath, localizedPath } from '@/lib/paths'
import { absoluteURL } from '@/lib/urls'

// Read on each request: feeds are fetched rarely, and caching would need its own revalidation.
export const dynamic = 'force-dynamic'

const escapeXML = (value: string): string =>
  value.replace(
    /[<>&'"]/g,
    (char) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[char]};`,
  )

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return new Response('Not Found', { status: 404 })
  }

  const t = await getTranslations({ locale, namespace: 'notes' })
  // A feed never shows drafts, even to the admin in preview.
  const { docs } = await findPublic({
    collection: 'notes',
    locale,
    sort: '-publishedAt',
    limit: 20,
    depth: 0,
    reader: { draft: false },
  })
  const self = absoluteURL(localizedPath('/notes/rss.xml', locale))
  const items = docs
    .map((note) => {
      const url = absoluteURL(documentPath('notes', note.slug, locale))

      return [
        '<item>',
        `<title>${escapeXML(note.title)}</title>`,
        `<link>${escapeXML(url)}</link>`,
        `<guid isPermaLink="true">${escapeXML(url)}</guid>`,
        `<pubDate>${new Date(note.publishedAt ?? note.createdAt).toUTCString()}</pubDate>`,
        `<description>${escapeXML(note.excerpt ?? '')}</description>`,
        '</item>',
      ].join('')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXML(t('feedTitle'))}</title>
<link>${escapeXML(absoluteURL(localizedPath('/notes', locale)))}</link>
<description>${escapeXML(t('feedDescription'))}</description>
<language>${locale}</language>
<atom:link href="${escapeXML(self)}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
