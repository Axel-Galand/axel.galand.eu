import type { Locale } from './locales'

/** Internal routes (folders under `app/(frontend)/[locale]`) and their public path per locale. */
export const pathnames = {
  '/': '/',
  '/projets': { fr: '/projets', en: '/projects' },
  '/projets/[slug]': { fr: '/projets/[slug]', en: '/projects/[slug]' },
  '/parcours': { fr: '/parcours', en: '/background' },
  '/notes': '/notes',
  '/notes/[slug]': '/notes/[slug]',
  '/notes/rss.xml': '/notes/rss.xml',
  '/perso': { fr: '/perso', en: '/personal' },
  '/perso/[slug]': { fr: '/perso/[slug]', en: '/personal/[slug]' },
  '/cv.pdf': '/cv.pdf',
  '/mentions-legales': { fr: '/mentions-legales', en: '/legal-notice' },
} as const satisfies Record<string, string | Record<Locale, string>>

export type Route = keyof typeof pathnames
