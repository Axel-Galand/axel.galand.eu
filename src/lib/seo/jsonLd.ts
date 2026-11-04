import type { Locale } from '@/i18n/locales'
import type { Profile } from '@/payload-types'

import { absoluteURL } from '../urls'

export const person = (profile: Profile, locale: Locale) => ({
  '@type': 'Person',
  '@id': absoluteURL('/#person'),
  name: profile.name,
  jobTitle: profile.headline,
  url: absoluteURL(locale === 'fr' ? '/' : '/en'),
  ...(profile.location
    ? { address: { '@type': 'PostalAddress', addressLocality: profile.location } }
    : {}),
  sameAs: (profile.links ?? []).map(({ url }) => url),
})

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absoluteURL(path),
  })),
})
