import type { Locale } from './content'

// Localized path prefixes, shared by the SEO plugin, the sitemap and the routes.
const sections = {
  'case-studies': { fr: '/projets', en: '/en/projects' },
  notes: { fr: '/notes', en: '/en/notes' },
  albums: { fr: '/perso', en: '/en/personal' },
} as const

export type SectionSlug = keyof typeof sections

export const isSectionSlug = (slug: string): slug is SectionSlug => slug in sections

export const documentPath = (collection: SectionSlug, slug: string, locale: Locale): string =>
  `${sections[collection][locale]}/${slug}`

export const homePath = (locale: Locale): string => (locale === 'fr' ? '/' : '/en')
