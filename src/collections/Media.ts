import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Local storage until the Cloudinary adapter lands; /data/media is on the Coolify volume.
    staticDir: process.env.MEDIA_DIR || 'media',
  },
}
