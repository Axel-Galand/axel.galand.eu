import type { Field, FieldHook } from 'payload'

export const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return toSlug(value)
    }

    const fallback = data?.[fallbackField] ?? originalDoc?.[fallbackField]

    return typeof fallback === 'string' ? toSlug(fallback) : value
  }

/** One slug for both locales, derived from the title when left empty. */
export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  label: 'Slug',
  admin: {
    position: 'sidebar',
    description: 'Laisser vide pour le générer depuis le titre.',
  },
  hooks: {
    beforeValidate: [formatSlug(fallbackField)],
  },
})
