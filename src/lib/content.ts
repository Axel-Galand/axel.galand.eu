import config from '@payload-config'
import { draftMode, headers } from 'next/headers'
import {
  getPayload,
  type CollectionSlug,
  type DataFromCollectionSlug,
  type DataFromGlobalSlug,
  type GlobalSlug,
  type PaginatedDocs,
  type Where,
} from 'payload'
import { cache } from 'react'

import { isAdminUser } from '@/access'
import { defaultLocale, type Locale } from '@/i18n/locales'
import type { User } from '@/payload-types'

/** Published documents for everyone; drafts too, but only in preview and for the signed-in admin. */
export type Reader = { draft: false } | { draft: true; user: User }

const published: Where = { _status: { equals: 'published' } }

/**
 * The preview cookie alone is not enough to see drafts: Next's draft mode is independent of the
 * Payload session, so the session is checked on every preview render.
 */
export const getReader = cache(async (): Promise<Reader> => {
  if (!(await draftMode()).isEnabled) {
    return { draft: false }
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  return isAdminUser(user) ? { draft: true, user: user as User } : { draft: false }
})

// Collections with drafts: the only ones public pages list directly.
type ContentSlug = Extract<
  CollectionSlug,
  'case-studies' | 'notes' | 'albums' | 'experiences' | 'skills'
>

// A document exists in a locale other than French only once this localized field is filled.
const translatedField: Partial<Record<ContentSlug, string>> = {
  'case-studies': 'title',
  notes: 'title',
  albums: 'title',
  experiences: 'role',
}

type PublicFindArgs<TSlug extends ContentSlug> = {
  collection: TSlug
  locale: Locale
  where?: Where
  sort?: string | string[]
  limit?: number
  page?: number
  depth?: number
  reader?: Reader
}

/**
 * Public pages read through these helpers only. The Local API skips access control by default,
 * so they force it back on and never return drafts outside preview. They never fall back to
 * French either (`fallbackLocale: null` would): an untranslated document does not exist in English.
 * Only image alt texts and captions do (see frenchTextFallback).
 */
export const findPublic = async <TSlug extends ContentSlug>({
  where,
  locale,
  reader,
  ...args
}: PublicFindArgs<TSlug>): Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>> => {
  const payload = await getPayload({ config })
  const { draft, ...as } = reader ?? (await getReader())
  const field = translatedField[args.collection]
  const filters = [
    where,
    draft ? undefined : published,
    field && locale !== defaultLocale ? { [field]: { exists: true } } : undefined,
  ].filter((filter): filter is Where => Boolean(filter))

  return payload.find({
    ...args,
    locale,
    where: { and: filters },
    draft,
    user: 'user' in as ? as.user : undefined,
    overrideAccess: false,
    fallbackLocale: false,
    context: { publicSite: true },
  }) as Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>>
}

/** One document by slug, or `undefined` when it is not public (or not translated) in `locale`. */
export const findPublicBySlug = async <TSlug extends 'case-studies' | 'notes' | 'albums'>(
  collection: TSlug,
  slug: string,
  locale: Locale,
  options: { depth?: number; reader?: Reader } = {},
): Promise<DataFromCollectionSlug<TSlug> | undefined> => {
  const { docs } = await findPublic({
    collection,
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    ...options,
  })

  return docs[0]
}

/** The locales in which a document is public: drives hreflang, the sitemap and the language switch. */
export const publicLocales = async (
  collection: 'case-studies' | 'notes' | 'albums',
  slug: string,
  reader?: Reader,
): Promise<Locale[]> => {
  const found = await Promise.all(
    (['fr', 'en'] as const).map(async (locale) =>
      (await findPublicBySlug(collection, slug, locale, { depth: 0, reader })) ? locale : null,
    ),
  )

  return found.filter((locale): locale is Locale => locale !== null)
}

export const findPublicGlobal = async <TSlug extends GlobalSlug>({
  slug,
  locale,
  depth,
  reader,
}: {
  slug: TSlug
  locale: Locale
  depth?: number
  reader?: Reader
}): Promise<DataFromGlobalSlug<TSlug>> => {
  const payload = await getPayload({ config })
  const { draft, ...as } = reader ?? (await getReader())

  return payload.findGlobal({
    slug,
    locale,
    depth,
    draft,
    user: 'user' in as ? as.user : undefined,
    overrideAccess: false,
    fallbackLocale: false,
    context: { publicSite: true },
  }) as Promise<DataFromGlobalSlug<TSlug>>
}
