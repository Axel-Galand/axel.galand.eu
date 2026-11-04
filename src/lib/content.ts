import config from '@payload-config'
import {
  getPayload,
  type CollectionSlug,
  type DataFromCollectionSlug,
  type DataFromGlobalSlug,
  type GlobalSlug,
  type PaginatedDocs,
  type Where,
} from 'payload'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

const published: Where = { _status: { equals: 'published' } }

// Collections with drafts: the only ones public pages list directly.
type ContentSlug = Extract<
  CollectionSlug,
  'case-studies' | 'notes' | 'albums' | 'experiences' | 'skills'
>

type PublicFindArgs<TSlug extends ContentSlug> = {
  collection: TSlug
  locale: Locale
  where?: Where
  sort?: string | string[]
  limit?: number
  page?: number
  depth?: number
}

/**
 * Public pages read through these helpers only. The Local API skips access control by default,
 * so they force it back on, never return drafts, and fall back to French for missing English.
 */
export const findPublished = async <TSlug extends ContentSlug>({
  where,
  ...args
}: PublicFindArgs<TSlug>): Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>> => {
  const payload = await getPayload({ config })

  return payload.find({
    ...args,
    where: where ? { and: [where, published] } : published,
    overrideAccess: false,
    draft: false,
    fallbackLocale: defaultLocale,
  }) as Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>>
}

export const findPublishedGlobal = async <TSlug extends GlobalSlug>({
  slug,
  locale,
  depth,
}: {
  slug: TSlug
  locale: Locale
  depth?: number
}): Promise<DataFromGlobalSlug<TSlug>> => {
  const payload = await getPayload({ config })

  return payload.findGlobal({
    slug,
    locale,
    depth,
    overrideAccess: false,
    draft: false,
    fallbackLocale: defaultLocale,
  }) as Promise<DataFromGlobalSlug<TSlug>>
}
