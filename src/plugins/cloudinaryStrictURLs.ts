import type { Field, FieldHook, Plugin } from 'payload'
import { fieldAffectsData } from 'payload/shared'

// Cloudinary's names for the formats the media collection accepts.
const formats: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

/**
 * In strict transformations mode, Cloudinary serves an asset only under its format extension or
 * through an allowed named transformation. The Cloudinary plugin builds file URLs without an
 * extension and admin thumbnails with an ad-hoc transformation, so the account refuses both.
 * Must run after payloadCloudinaryPlugin in the plugins list.
 */
export const cloudinaryStrictURLs =
  (cloudName: string, collectionSlug = 'media', thumbnail = 't_pf_w480'): Plugin =>
  (config) => {
    const base = `https://res.cloudinary.com/${cloudName}/image/upload`

    // A field hook, after cloud-storage's: unlike a collection hook, it also runs on the reads
    // Payload makes for itself (the previous document of an update, the source of a duplicate).
    const addExtension: FieldHook = ({ data, value }) => {
      const format = formats[data?.mimeType]

      return typeof data?.cloudinaryPublicId === 'string' && format
        ? `${base}/${data.cloudinaryPublicId}.${format}`
        : value
    }

    const withExtension = (field: Field): Field =>
      fieldAffectsData(field) && field.name === 'url'
        ? ({
            ...field,
            hooks: { ...field.hooks, afterRead: [...(field.hooks?.afterRead ?? []), addExtension] },
          } as Field)
        : field

    return {
      ...config,
      collections: (config.collections ?? []).map((collection) => {
        if (collection.slug !== collectionSlug || typeof collection.upload !== 'object') {
          return collection
        }

        return {
          ...collection,
          fields: collection.fields.map(withExtension),
          // A select or a populated relation without these would leave the hook nothing to build on.
          forceSelect: { ...collection.forceSelect, mimeType: true, cloudinaryPublicId: true },
          upload: {
            ...collection.upload,
            adminThumbnail: ({ doc }) => {
              const publicId = doc.cloudinaryPublicId

              return typeof publicId === 'string' ? `${base}/${thumbnail}/${publicId}` : null
            },
          },
        }
      }),
    }
  }
