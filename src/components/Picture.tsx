import type { Media } from '@/payload-types'
import { imageSources } from '@/lib/images'

type Props = {
  media: Media | number | null | undefined
  /** The `sizes` attribute: how wide the image is drawn, so the browser picks the right file. */
  sizes: string
  eager?: boolean
  className?: string
}

/** A plain <img> over Cloudinary's named transformations; the blur shows until the file loads. */
export function Picture({ media, sizes, eager = false, className }: Props) {
  if (!media || typeof media === 'number') {
    return null
  }

  const { src, srcSet } = imageSources(media)

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary does the resizing, not next/image.
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={media.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={
        media.blurDataUrl
          ? { backgroundImage: `url(${media.blurDataUrl})`, backgroundSize: 'cover' }
          : undefined
      }
    />
  )
}
