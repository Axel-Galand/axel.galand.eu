import type { Field, FieldHook } from 'payload'

export const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const defaultLocale = 'fr'

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc, req }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return toSlug(value) || undefined
    }

    // The slug is shared by both locales and the French URL is canonical: only a French title
    // may produce it, so an English-first save leaves it empty until the French one.
    if (req.locale && req.locale !== defaultLocale) {
      return value
    }

    const fallback = data?.[fallbackField] ?? originalDoc?.[fallbackField]

    return typeof fallback === 'string' ? toSlug(fallback) || undefined : value
  }

/** One slug for both locales, derived from the French title when left empty. */
export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  // Drafts skip validation, so a missing slug only blocks publishing.
  required: true,
  label: 'Slug',
  admin: {
    position: 'sidebar',
    description: 'Laisser vide pour le générer depuis le titre français.',
  },
  hooks: {
    beforeValidate: [formatSlug(fallbackField)],
  },
})
