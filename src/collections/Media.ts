import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { setBlurDataURL } from '@/hooks/setBlurDataURL'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    group: 'Médias',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
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
    },
    { name: 'caption', type: 'text', localized: true, label: 'Légende' },
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
