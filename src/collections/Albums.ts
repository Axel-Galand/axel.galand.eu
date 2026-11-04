import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'
import { slugField } from '@/fields/slug'

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: { singular: 'Album', plural: 'Albums' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'season', '_status', 'updatedAt'],
    group: 'Perso',
  },
  defaultSort: '-season',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    beforeOperation: [forceDraftForMcp],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titre' },
    {
      name: 'season',
      type: 'number',
      required: true,
      label: 'Saison',
      admin: { description: 'Année, par exemple 2026.' },
    },
    { name: 'description', type: 'textarea', localized: true, label: 'Description' },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true, label: 'Couverture' },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Photos',
      admin: {
        description:
          'Glisser plusieurs fichiers pour un upload groupé. Le texte alternatif et la légende se règlent sur chaque média.',
      },
    },
    slugField(),
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Ordre',
      admin: { position: 'sidebar', description: 'Départage deux albums de la même saison.' },
    },
  ],
}
