import type { FieldHook } from 'payload'

import { defaultLocale } from '@/i18n/locales'

type FrenchTexts = Record<string, unknown>

/**
 * Public reads never fall back to French, except here: an image described in French serves a
 * screen reader better than an image with no description at all. Untranslated alt texts and
 * captions are read once per request and media, in French.
 *
 * Only for the public site (`publicSite` in the request context, set by src/lib/content.ts): the
 * admin must see the English field empty, or saving it would store the French text as English.
 */
export const frenchTextFallback =
  (collection: 'media'): FieldHook =>
  async ({ value, data, field, req }) => {
    const id = data?.id
    const locale = req.locale
    const name = 'name' in field ? field.name : undefined

    if (
      value ||
      !req.context.publicSite ||
      !id ||
      !locale ||
      locale === defaultLocale ||
      locale === 'all' ||
      !name
    ) {
      return value
    }

    const cache = ((req.context.frenchTexts as Map<string, Promise<FrenchTexts>> | undefined) ??=
      new Map())
    const key = `${collection}:${id}`

    if (!cache.has(key)) {
      // A separate request: passing `req` would switch the current read to French.
      cache.set(
        key,
        req.payload
          .findByID({ collection, id, locale: defaultLocale, depth: 0, fallbackLocale: false })
          .then((doc) => doc as unknown as FrenchTexts)
          .catch(() => ({})),
      )
    }

    return (await cache.get(key))?.[name] ?? value
  }
