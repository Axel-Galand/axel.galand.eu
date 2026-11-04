import { revalidatePath } from 'next/cache'
import type { Plugin } from 'payload'

/**
 * Drops every cached public page. The site is small, so re-rendering all of it on the next visits
 * costs nothing, and it avoids mapping public URLs back to the internal paths next-intl rewrites
 * them to (`/projets/x` is cached as `/fr/projets/x`).
 */
export const revalidateSite = (): void => {
  try {
    revalidatePath('/(frontend)/[locale]', 'layout')
  } catch (error) {
    // Outside a Next request (seed, scripts, tests) nothing is cached, so there is nothing to drop.
    if (!(error instanceof Error && error.message.includes('static generation store missing'))) {
      throw error
    }
  }
}

type Context = Record<string, unknown> | undefined

const unlessDisabled = (context: Context) => {
  if (!context?.disableRevalidate) {
    revalidateSite()
  }
}

/**
 * Any change to content the pages show, drafts included: a draft save over a published document
 * costs one needless re-render, a missed publish would leave a stale page.
 */
export const revalidateSiteOn =
  ({ collections, globals }: { collections: string[]; globals: string[] }): Plugin =>
  (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) =>
      collections.includes(collection.slug)
        ? {
            ...collection,
            hooks: {
              ...collection.hooks,
              afterChange: [
                ...(collection.hooks?.afterChange ?? []),
                ({ doc, context }) => {
                  unlessDisabled(context)

                  return doc
                },
              ],
              afterDelete: [
                ...(collection.hooks?.afterDelete ?? []),
                ({ doc, context }) => {
                  unlessDisabled(context)

                  return doc
                },
              ],
            },
          }
        : collection,
    ),
    globals: (config.globals ?? []).map((global) =>
      globals.includes(global.slug)
        ? {
            ...global,
            hooks: {
              ...global.hooks,
              afterChange: [
                ...(global.hooks?.afterChange ?? []),
                ({ doc, context }) => {
                  unlessDisabled(context)

                  return doc
                },
              ],
            },
          }
        : global,
    ),
  })
