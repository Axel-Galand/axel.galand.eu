import { cache } from 'react'

import type { Locale } from '@/i18n/locales'

import { publicLocales } from './content'
import { documentPath, type SectionSlug } from './paths'
import type { LocalePaths } from './seo/metadata'

/** A document's path in each locale where it is public: hreflang and the language switch. */
export const documentPaths = cache(
  async (collection: SectionSlug, slug: string): Promise<LocalePaths> =>
    Object.fromEntries(
      (await publicLocales(collection, slug)).map((locale: Locale) => [
        locale,
        documentPath(collection, slug, locale),
      ]),
    ),
)
