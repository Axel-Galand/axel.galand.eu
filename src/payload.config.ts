import { payloadCloudinaryPlugin } from '@jhb.software/payload-cloudinary-plugin'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Albums } from './collections/Albums'
import { CaseStudies } from './collections/CaseStudies'
import { Experiences } from './collections/Experiences'
import { Media } from './collections/Media'
import { Notes } from './collections/Notes'
import { Skills } from './collections/Skills'
import { Users } from './collections/Users'
import { Profile } from './globals/Profile'
import { SiteSettings } from './globals/SiteSettings'
import { documentPath, homePath, isSectionSlug } from './lib/paths'
import { getServerURL } from './lib/serverURL'
import { writeRichTextTool } from './mcp/writeRichText'
import { migrations } from './migrations'
import { cloudinaryAdminThumbnail } from './plugins/cloudinaryAdminThumbnail'
import { undoFailedUploads } from './plugins/undoFailedUploads'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Read at runtime (not NEXT_PUBLIC_), so the same image works for any host.
const serverURL = getServerURL()

// Without credentials (dev, CI) media stay on the local disk. The plugin adds columns, so production
// migrations are generated with it enabled.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? ''
const useCloudinary = cloudName.length > 0

const mcpContent = { find: true, create: true, update: true }

export default buildConfig({
  serverURL,
  csrf: [serverURL],
  cors: [serverURL],
  // The admin only needs REST; GraphQL would be one more public surface.
  graphQL: {
    disable: true,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  collections: [Users, Media, CaseStudies, Notes, Albums, Experiences, Skills],
  globals: [Profile, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
    // Dev and tests boot without Cloudinary, so generating on boot would drop the plugin's fields.
    // `pnpm generate:types` enables it.
    autoGenerate: false,
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    // Applied on startup in production; dev keeps Payload's schema push.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['case-studies', 'notes', 'albums'],
      globals: ['profile'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} · Axel Galand` : 'Axel Galand'),
      generateDescription: ({ doc }) => doc?.summary ?? doc?.excerpt ?? doc?.description ?? '',
      generateURL: ({ doc, collectionConfig, locale }) => {
        const lang = locale === 'en' ? 'en' : 'fr'
        const slug = collectionConfig?.slug

        return slug && isSectionSlug(slug) && typeof doc?.slug === 'string'
          ? `${serverURL}${documentPath(slug, doc.slug, lang)}`
          : `${serverURL}${homePath(lang)}`
      },
    }),
    mcpPlugin({
      userCollection: 'users',
      collections: {
        'case-studies': {
          enabled: mcpContent,
          description: 'Anonymized case studies of client projects. Never name the client.',
        },
        notes: { enabled: mcpContent, description: 'Technical notes (blog posts).' },
        albums: { enabled: mcpContent, description: 'Personal photo albums (enduro seasons…).' },
        experiences: { enabled: mcpContent, description: 'Jobs and education for the resume.' },
        skills: { enabled: mcpContent, description: 'Skills, grouped by category.' },
        media: { enabled: { find: true }, description: 'Uploaded images (read only).' },
      },
      globals: {
        profile: {
          enabled: { find: true, update: true },
          description: 'Name, headline, bio, links.',
        },
        'site-settings': { enabled: { find: true, update: true }, description: 'SEO defaults.' },
      },
      mcp: {
        tools: [writeRichTextTool],
      },
    }),
    payloadCloudinaryPlugin({
      enabled: useCloudinary,
      cloudName,
      credentials: {
        apiKey: process.env.CLOUDINARY_API_KEY ?? '',
        apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
      },
      folder: process.env.CLOUDINARY_FOLDER || 'portfolio',
      // Random public ids: no original filename in public URLs, and no photo.jpg / photo.png collision.
      useFilename: false,
      collections: {
        // Direct res.cloudinary.com URLs: otherwise every file would be proxied through the VPS.
        media: { disablePayloadAccessControl: true },
      },
    }),
    ...(useCloudinary ? [cloudinaryAdminThumbnail(cloudName), undoFailedUploads()] : []),
  ],
})
