import type { GlobalConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceGlobalDraftForMcp } from '@/hooks/forceDraftForMcp'

export const Profile: GlobalConfig = {
  slug: 'profile',
  label: 'Profil',
  admin: { group: 'Parcours' },
  access: {
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  hooks: {
    beforeOperation: [forceGlobalDraftForMcp],
  },
  versions: {
    drafts: true,
    max: 20,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom' },
        { name: 'location', type: 'text', localized: true, label: 'Localisation' },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      localized: true,
      label: 'Accroche',
      admin: {
        description: 'Une ligne, par exemple « Développeur full-stack, Next.js et Payload ».',
      },
    },
    { name: 'bio', type: 'richText', localized: true, label: 'Présentation' },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Photo' },
    {
      name: 'email',
      type: 'email',
      label: 'E-mail de contact',
      admin: { description: 'Affiché sur le site et dans le CV. Pas de téléphone ni d’adresse.' },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Liens',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              type: 'select',
              required: true,
              label: 'Type',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'GitHub', value: 'github' },
                { label: 'Autre', value: 'other' },
              ],
            },
            { name: 'label', type: 'text', localized: true, label: 'Libellé' },
            { name: 'url', type: 'text', required: true, label: 'URL' },
          ],
        },
      ],
    },
    {
      name: 'languages',
      type: 'array',
      label: 'Langues',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'language', type: 'text', required: true, localized: true, label: 'Langue' },
            { name: 'level', type: 'text', required: true, localized: true, label: 'Niveau' },
          ],
        },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      label: 'Certifications',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Nom' },
            { name: 'issuer', type: 'text', label: 'Organisme' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'date', label: 'Date' },
            { name: 'url', type: 'text', label: 'URL de vérification' },
          ],
        },
      ],
    },
  ],
}
