import type { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'

/**
 * A 16px WebP of the image, inlined as next/image's blur placeholder. It is computed from the file
 * Payload already decoded and resized, so the VPS does this once per upload and never at runtime.
 */
export const setBlurDataURL: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file

  if (!file || !file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    return data
  }

  const input = file.data?.length ? file.data : file.tempFilePath

  if (!input) {
    return data
  }

  const tiny = await sharp(input).resize(16).webp({ quality: 40 }).toBuffer()

  return { ...data, blurDataUrl: `data:image/webp;base64,${tiny.toString('base64')}` }
}
