import { isLocale } from '@/i18n/locales'

import { documentPath, localizedPath, type SectionSlug } from './paths'
import type { Route } from '@/i18n/pathnames'

const previewURL = (path: string): string => `/next/preview?path=${encodeURIComponent(path)}`

/** `admin.preview` for a collection with its own pages: the document's page in the admin's locale. */
export const previewDocument =
  (collection: SectionSlug) =>
  (doc: Record<string, unknown>, { locale }: { locale: string }): string | null =>
    typeof doc.slug === 'string' && doc.slug && isLocale(locale)
      ? previewURL(documentPath(collection, doc.slug, locale))
      : null

/** `admin.preview` for content shown on a fixed page (profile, experiences, skills). */
export const previewRoute =
  (route: Route) =>
  (_doc: Record<string, unknown>, { locale }: { locale: string }): string =>
    previewURL(localizedPath(route, isLocale(locale) ? locale : 'fr'))
