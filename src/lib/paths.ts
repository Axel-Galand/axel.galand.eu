import { defaultLocale, type Locale } from '@/i18n/locales'
import { pathnames, type Route } from '@/i18n/pathnames'

/**
 * The public path of an internal route, as next-intl's `as-needed` prefix builds it. A plain
 * function, so Payload's config, the sitemap and the pages share it without next-intl.
 */
export const localizedPath = (
  route: Route,
  locale: Locale,
  params: Record<string, string> = {},
): string => {
  const entry: string | Record<Locale, string> = pathnames[route]
  const template = typeof entry === 'string' ? entry : entry[locale]
  const path = template.replace(/\[(\w+)\]/g, (_, name: string) =>
    encodeURIComponent(params[name] ?? ''),
  )
  const prefix = locale === defaultLocale ? '' : `/${locale}`

  return path === '/' ? prefix || '/' : `${prefix}${path}`
}

// The detail route of each collection with public pages.
const sections = {
  'case-studies': '/projets/[slug]',
  notes: '/notes/[slug]',
  albums: '/perso/[slug]',
} as const satisfies Record<string, Route>

export type SectionSlug = keyof typeof sections

export const isSectionSlug = (slug: string): slug is SectionSlug => slug in sections

export const documentPath = (collection: SectionSlug, slug: string, locale: Locale): string =>
  localizedPath(sections[collection], locale, { slug })

export const homePath = (locale: Locale): string => localizedPath('/', locale)
