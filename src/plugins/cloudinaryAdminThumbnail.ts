import type { Plugin } from 'payload'

/**
 * The Cloudinary plugin builds admin thumbnails with an ad-hoc transformation, which the account
 * refuses in strict transformations mode. Point them at an allowed named transformation instead.
 * Must run after payloadCloudinaryPlugin in the plugins list.
 */
export const cloudinaryAdminThumbnail =
  (cloudName: string, collectionSlug = 'media', transformation = 't_pf_w480'): Plugin =>
  (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => {
      if (collection.slug !== collectionSlug || typeof collection.upload !== 'object') {
        return collection
      }

      return {
        ...collection,
        upload: {
          ...collection.upload,
          adminThumbnail: ({ doc }) => {
            const publicId = doc.cloudinaryPublicId

            return typeof publicId === 'string'
              ? `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`
              : null
          },
        },
      }
    }),
  })
