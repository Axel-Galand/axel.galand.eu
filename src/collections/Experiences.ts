import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'

const monthPicker = {
  date: { pickerAppearance: 'monthOnly' as const, displayFormat: 'MM/yyyy' },
}

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Expérience ou formation', plural: 'Expériences et formations' },
  admin: {
    useAsTitle: 'organization',
    defaultColumns: ['organization', 'role', 'kind', 'start'],
    group: 'Parcours',
  },
  defaultSort: '-start',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeOperation: [forceDraftForMcp],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'job',
      label: 'Type',
      options: [
        { label: 'Emploi', value: 'job' },
        { label: 'Formation', value: 'education' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organization', type: 'text', required: true, label: 'Organisation' },
        { name: 'location', type: 'text', localized: true, label: 'Lieu' },
      ],
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      label: 'Poste ou diplôme',
    },
    {
      type: 'row',
      fields: [
        { name: 'start', type: 'date', required: true, label: 'Début', admin: monthPicker },
        {
          name: 'end',
          type: 'date',
          label: 'Fin',
          admin: { ...monthPicker, description: 'Vide si en cours.' },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Points clés',
      fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Texte' }],
    },
    {
      name: 'caseStudies',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
      label: 'Études de cas liées',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Ordre',
      admin: { position: 'sidebar', description: 'Départage deux entrées à la même date.' },
    },
  ],
}
