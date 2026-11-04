import type { CollectionConfig } from 'payload'

import { authenticated, isAdminUser } from '@/access'
import { frenchTextFallback } from '@/hooks/frenchTextFallback'
import { setBlurDataURL } from '@/hooks/setBlurDataURL'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    group: 'Médias',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    // The files are public, the list is not: an anonymous REST call must not enumerate uploads that
    // only drafts use. Public pages populate media through the Local API; admin and MCP are users.
    read: ({ req, isReadingStaticFile }) =>
      isAdminUser(req.user) || req.payloadAPI === 'local' || Boolean(isReadingStaticFile),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [setBlurDataURL],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: 'Texte alternatif',
      admin: { description: 'Décrit l’image pour les lecteurs d’écran et le SEO.' },
      hooks: { afterRead: [frenchTextFallback('media')] },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: 'Légende',
      hooks: { afterRead: [frenchTextFallback('media')] },
    },
    {
      name: 'blurDataUrl',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  upload: {
    // Local fallback when Cloudinary is not configured (dev, CI); /data/media is on the Coolify volume.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    // Re-encoding the original drops its EXIF (GPS included) and keeps it under Cloudinary's
    // free-plan limits (10 MB, 25 MP). Sizes and crops are Cloudinary's job, not the VPS's.
    resizeOptions: {
      width: 3200,
      height: 3200,
      fit: 'inside',
      withoutEnlargement: true,
    },
    crop: false,
    focalPoint: false,
  },
}
