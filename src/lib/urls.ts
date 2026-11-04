import { getServerURL } from './serverURL'

/** Absolute URL of a site path, for feeds, JSON-LD and the sitemap (metadata uses metadataBase). */
export const absoluteURL = (path: string): string => new URL(path, getServerURL()).toString()
