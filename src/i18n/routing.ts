import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from './locales'
import { pathnames } from './pathnames'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  pathnames,
  // Pages emit hreflang themselves, and only for the translations that exist.
  alternateLinks: false,
})
