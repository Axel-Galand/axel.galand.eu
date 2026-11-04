import type { CollectionAfterChangeHook, CollectionSlug, Plugin } from 'payload'
import { fieldAffectsData } from 'payload/shared'

/**
 * The Cloudinary upload runs in an afterChange hook, once the row is written. db-sqlite has no
 * transactions here (turning them on makes concurrent writes fail with SQLITE_BUSY), so a failed
 * upload would leave the write in place: a new row pointing at a file that does not exist, or an
 * existing one describing a file Cloudinary never received. Undo the write when the hook fails.
 * Must run after payloadCloudinaryPlugin in the plugins list.
 */
export const undoFailedUploads =
  (collectionSlug: CollectionSlug = 'media'): Plugin =>
  (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => {
      if (collection.slug !== collectionSlug) {
        return collection
      }

      // previousDoc holds a single locale, but the adapter only writes localized fields given per
      // locale. Media has no localized field below the top level.
      const localized = collection.fields.flatMap((field) =>
        fieldAffectsData(field) && field.localized ? [field.name] : [],
      )
      const asWritten = (doc: Record<string, unknown>, locale?: string) =>
        locale && locale !== 'all'
          ? {
              ...doc,
              ...Object.fromEntries(localized.map((name) => [name, { [locale]: doc[name] }])),
            }
          : doc

      const undoOnFailure =
        (hook: CollectionAfterChangeHook): CollectionAfterChangeHook =>
        async (args) => {
          try {
            return await hook(args)
          } catch (error) {
            const { doc, operation, previousDoc, req } = args

            // Straight to the adapter: the hooks would act on a file Cloudinary never received.
            const undo =
              operation === 'create'
                ? req.payload.db.deleteOne({
                    collection: collectionSlug,
                    where: { id: { equals: doc.id } },
                    req,
                  })
                : req.payload.db.updateOne({
                    collection: collectionSlug,
                    id: doc.id,
                    data: asWritten(previousDoc, req.locale),
                    req,
                  })

            await undo.catch((err: unknown) =>
              req.payload.logger.error({
                err,
                msg: `Could not undo the failed upload of ${collectionSlug} ${doc.id}`,
              }),
            )
            throw error
          }
        }

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: (collection.hooks?.afterChange ?? []).map(undoOnFailure),
        },
      }
    }),
  })
