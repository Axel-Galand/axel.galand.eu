import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'
import { previewRoute } from '@/lib/preview'

import { skillCategories } from './Skills'

/** The few technologies the site puts forward, above the full list of skills. */
export const Expertises: CollectionConfig = {
  slug: 'expertises',
  labels: { singular: 'Expertise', plural: 'Expertises' },
  admin: {
    useAsTitle: 'name',
    preview: previewRoute('/parcours'),
    defaultColumns: ['name', 'version', 'category', 'order', '_status'],
    group: 'Parcours',
  },
  defaultSort: 'order',
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
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom' },
        {
          name: 'version',
          type: 'text',
          label: 'Version affichée',
          admin: { description: 'Par exemple « 16 ». Vide si sans objet.' },
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          label: 'Famille',
          options: [...skillCategories],
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Ce que j’en fais',
      admin: {
        description: 'Une ou deux phrases. Sans texte anglais, l’expertise est absente de /en.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'caseStudies',
          type: 'relationship',
          relationTo: 'case-studies',
          hasMany: true,
          label: 'Projets liés',
        },
        {
          name: 'notes',
          type: 'relationship',
          relationTo: 'notes',
          hasMany: true,
          label: 'Notes liées',
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Ordre',
      admin: { position: 'sidebar' },
    },
  ],
}
