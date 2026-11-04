import type { Media } from '@/payload-types'

import { absoluteURL } from './urls'

// The named transformations allowed in the account's strict mode (see PLAN.md, Cloudinary).
const widths = [480, 960, 1440, 1920] as const

const cloudinaryBase = (): string | undefined => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  return cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload` : undefined
}

const publicId = (media: Media): string | undefined =>
  cloudinaryBase() && media.cloudinaryPublicId && media.mimeType !== 'image/svg+xml'
    ? media.cloudinaryPublicId
    : undefined

export type ImageSources = { src: string; srcSet?: string }

/**
 * A width-based srcset over the named transformations. They never enlarge (`c_limit`), so the
 * descriptors stop at the original width. Without Cloudinary (dev, tests) and for SVG, the file URL.
 */
export const imageSources = (media: Media): ImageSources => {
  const id = publicId(media)

  if (!id) {
    return { src: media.url ?? '' }
  }

  const base = cloudinaryBase()
  const seen = new Set<number>()
  const srcSet = widths
    .map((width) => ({
      width: Math.min(width, media.width ?? width),
      url: `${base}/t_pf_w${width}/${id}`,
    }))
    .filter(({ width }) => !seen.has(width) && seen.add(width))
    .map(({ width, url }) => `${url} ${width}w`)
    .join(', ')

  return { src: `${base}/t_pf_w960/${id}`, srcSet }
}

/** The 1200x630 social card of an image, as an absolute URL. */
export const ogImage = (media: Media | number | null | undefined) => {
  if (!media || typeof media === 'number') {
    return undefined
  }

  const id = publicId(media)

  return id
    ? { url: `${cloudinaryBase()}/t_pf_og/${id}`, width: 1200, height: 630, alt: media.alt }
    : media.url
      ? {
          url: absoluteURL(media.url),
          width: media.width ?? undefined,
          height: media.height ?? undefined,
          alt: media.alt,
        }
      : undefined
}
