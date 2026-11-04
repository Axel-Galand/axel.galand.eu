import { BlocksFeature, CodeBlock, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { forceDraftForMcp } from '@/hooks/forceDraftForMcp'
import { slugField } from '@/fields/slug'
import { previewDocument } from '@/lib/preview'

// Keys are what a Markdown fence may say (```ts); short aliases are listed so writing through MCP
// never fails the block's language validation.
export const codeLanguages: Record<string, string> = {
  plaintext: 'Texte',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  json: 'JSON',
  shell: 'Shell',
  bash: 'Bash',
  sh: 'Shell',
  zsh: 'Zsh',
  yaml: 'YAML',
  yml: 'YAML',
  dockerfile: 'Dockerfile',
  ini: 'INI',
  toml: 'TOML',
  sql: 'SQL',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  xml: 'XML',
  python: 'Python',
  py: 'Python',
  php: 'PHP',
  swift: 'Swift',
  diff: 'Diff',
  nginx: 'Nginx',
}

export const Notes: CollectionConfig = {
  slug: 'notes',
  labels: { singular: 'Note technique', plural: 'Notes techniques' },
  admin: {
    useAsTitle: 'title',
    preview: previewDocument('notes'),
    defaultColumns: ['title', 'publishedAt', '_status', 'updatedAt'],
    group: 'Contenu',
  },
  defaultSort: '-publishedAt',
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
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Chapô',
      admin: { description: 'Une ou deux phrases, reprises dans la liste, le RSS et le SEO.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Image (optionnelle)' },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: 'Contenu',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [CodeBlock({ languages: codeLanguages, defaultLanguage: 'plaintext' })],
          }),
        ],
      }),
    },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de publication',
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'Tags',
      admin: { position: 'sidebar' },
    },
  ],
}
