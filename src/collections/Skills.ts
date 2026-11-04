import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'

export const skillCategories = [
  { label: 'Front', value: 'front' },
  { label: 'Back', value: 'back' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'CMS', value: 'cms' },
  { label: 'Données', value: 'data' },
  { label: 'Infra et DevOps', value: 'infra' },
  { label: 'Qualité et tests', value: 'quality' },
  { label: 'IA et outillage', value: 'tooling' },
] as const

export const Skills: CollectionConfig = {
  slug: 'skills',
  labels: { singular: 'Compétence', plural: 'Compétences' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'order'],
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
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Nom',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Catégorie',
      options: [...skillCategories],
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
