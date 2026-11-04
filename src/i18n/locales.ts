// No imports: the proxy, Payload's config and the pages all read this.
export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale)
