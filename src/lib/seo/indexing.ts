/**
 * The site stays out of search engines until SITE_INDEXABLE is exactly "true".
 * A missing or misspelled value keeps it noindex, so a bad deploy fails closed.
 */
export const isIndexable = (env: Record<string, string | undefined> = process.env): boolean =>
  env.SITE_INDEXABLE === 'true'

export const NOINDEX_DIRECTIVES = 'noindex, nofollow'
