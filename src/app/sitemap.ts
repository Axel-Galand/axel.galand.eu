import type { MetadataRoute } from 'next'

import { locales, type Locale } from '@/i18n/locales'
import { findPublic, type Reader } from '@/lib/content'
import { documentPath, localizedPath, type SectionSlug } from '@/lib/paths'
import type { Route } from '@/i18n/pathnames'
import { absoluteURL } from '@/lib/urls'

// Read on each request: the build has no database, and the sitemap is fetched rarely.
export const dynamic = 'force-dynamic'

const visitor: Reader = { draft: false }

// Pages that exist in every locale, whatever the content.
const staticRoutes: Route[] = [
  '/',
  '/projets',
  '/parcours',
  '/notes',
  '/perso',
  '/mentions-legales',
]

const languages = (pathFor: (locale: Locale) => string, available: readonly Locale[]) => ({
  languages: {
    ...Object.fromEntries(available.map((locale) => [locale, absoluteURL(pathFor(locale))])),
    ...(available.includes('fr') ? { 'x-default': absoluteURL(pathFor('fr')) } : {}),
  },
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteURL(localizedPath(route, locale)),
      alternates: languages((other) => localizedPath(route, other), locales),
    })),
  )

  const collections: SectionSlug[] = ['case-studies', 'notes', 'albums']
  const documents = await Promise.all(
    collections.map(async (collection) => {
      // Per locale: a document only counts where it is translated.
      const byLocale = await Promise.all(
        locales.map(async (locale) => ({
          locale,
          docs: (await findPublic({ collection, locale, limit: 1000, depth: 0, reader: visitor }))
            .docs,
        })),
      )
      const slugs = new Map<string, { locales: Locale[]; updatedAt: string }>()

      for (const { locale, docs } of byLocale) {
        for (const doc of docs) {
          const entry = slugs.get(doc.slug) ?? { locales: [], updatedAt: doc.updatedAt }
          entry.locales.push(locale)
          slugs.set(doc.slug, entry)
        }
      }

      return [...slugs].flatMap(([slug, { locales: available, updatedAt }]) =>
        available.map((locale) => ({
          url: absoluteURL(documentPath(collection, slug, locale)),
          lastModified: updatedAt,
          alternates: languages((other) => documentPath(collection, slug, other), available),
        })),
      )
    }),
  )

  return [...pages, ...documents.flat()]
}
