import type { CollectionConfig, Field } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'
import { slugField } from '@/fields/slug'
import { previewDocument } from '@/lib/preview'

const monthPicker = {
  date: { pickerAppearance: 'monthOnly' as const, displayFormat: 'MM/yyyy' },
}

const section = (name: string, label: string, description: string): Field => ({
  name,
  type: 'richText',
  localized: true,
  label,
  admin: { description },
})

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Étude de cas', plural: 'Études de cas' },
  admin: {
    useAsTitle: 'title',
    preview: previewDocument('case-studies'),
    defaultColumns: ['title', 'sector', 'featured', '_status', 'updatedAt'],
    group: 'Contenu',
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
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titre' },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Résumé',
      admin: {
        description: 'Deux ou trois phrases, reprises dans la liste et en description SEO.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sector',
          type: 'text',
          required: true,
          localized: true,
          label: 'Secteur (anonymisé)',
          admin: { description: 'Par exemple « Location de self-stockage, 5 pays ».' },
        },
        { name: 'role', type: 'text', localized: true, label: 'Mon rôle' },
      ],
    },
    {
      name: 'period',
      type: 'group',
      label: 'Période',
      fields: [
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
      ],
    },
    {
      name: 'stack',
      type: 'relationship',
      relationTo: 'skills',
      hasMany: true,
      label: 'Stack',
    },
    {
      name: 'metrics',
      type: 'array',
      // One list per language (see Experiences.highlights).
      localized: true,
      label: 'Chiffres clés',
      admin: { description: 'Des ordres de grandeur, jamais un chiffre qui identifie le client.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, label: 'Valeur' },
            { name: 'label', type: 'text', required: true, label: 'Libellé' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'cover', type: 'upload', relationTo: 'media', label: 'Couverture' },
        {
          name: 'diagram',
          type: 'upload',
          relationTo: 'media',
          label: "Schéma d'architecture",
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Récit',
      fields: [
        section('context', 'Contexte', 'Le produit et son échelle, sans nommer le client.'),
        section('challenge', 'Défi', 'Le problème à résoudre.'),
        section('work', "Ce que j'ai fait", 'Mes décisions et réalisations techniques.'),
        section('result', 'Résultat', 'Ce qui a changé, chiffres à l’appui si possible.'),
        section('learnings', "Ce que j'ai appris", 'Une ou deux leçons.'),
      ],
    },
    slugField(),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: "Mise en avant sur l'accueil",
      admin: { position: 'sidebar' },
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
