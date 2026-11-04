import type { Metadata } from 'next'

import { defaultLocale, type Locale } from '@/i18n/locales'
import type { Media } from '@/payload-types'

import { ogImage } from '../images'

/** A page's path in each locale where it exists. */
export type LocalePaths = Partial<Record<Locale, string>>

/** Canonical and hreflang: only the translations that exist, and x-default on the French page. */
export const alternates = (locale: Locale, paths: LocalePaths): Metadata['alternates'] => ({
  canonical: paths[locale],
  languages: {
    ...paths,
    ...(paths[defaultLocale] ? { 'x-default': paths[defaultLocale] } : {}),
  },
})

type PageMetadataArgs = {
  locale: Locale
  paths: LocalePaths
  title?: string
  description?: string
  image?: Media | number | null
  type?: 'website' | 'article' | 'profile'
}

export const pageMetadata = ({
  locale,
  paths,
  title,
  description,
  image,
  type = 'website',
}: PageMetadataArgs): Metadata => {
  const card = ogImage(image)

  return {
    title,
    description,
    alternates: alternates(locale, paths),
    openGraph: {
      type,
      siteName: 'Axel Galand',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: paths[locale],
      title,
      description,
      images: card ? [card] : undefined,
    },
    twitter: { card: card ? 'summary_large_image' : 'summary' },
  }
}

/** The SEO plugin's fields win over the document's own title, summary and cover. */
export const seoFields = (
  doc: {
    meta?: { title?: string | null; description?: string | null; image?: Media | number | null }
  },
  fallback: { title?: string; description?: string; image?: Media | number | null },
) => ({
  title: doc.meta?.title || fallback.title,
  description: doc.meta?.description || fallback.description,
  image: doc.meta?.image || fallback.image,
})
