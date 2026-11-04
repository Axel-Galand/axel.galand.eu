import type { GlobalConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceGlobalDraftForMcp } from '@/hooks/forceDraftForMcp'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: { group: 'Réglages' },
  access: {
    read: publishedOrAuthenticated,
    update: authenticated,
    readVersions: authenticated,
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
      name: 'defaultTitle',
      type: 'text',
      required: true,
      localized: true,
      label: 'Titre par défaut',
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description par défaut',
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Image de partage par défaut',
    },
  ],
}
