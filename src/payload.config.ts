import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { migrations } from './migrations'
import { getServerURL } from './lib/serverURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Read at runtime (not NEXT_PUBLIC_), so the same image works for any host.
const serverURL = getServerURL()

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
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    // Applied on startup in production; dev keeps Payload's schema push.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
})
