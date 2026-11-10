import crypto from 'crypto'
import type { Payload } from 'payload'

import type { User } from '@/payload-types'

const contentRights = { find: true, create: true, update: true }

/** An MCP API key for `user`, with the same rights the real one gets. Returns the raw key. */
export const createMcpKey = async (payload: Payload, user: User, label: string) => {
  await payload.delete({ collection: 'payload-mcp-api-keys', where: { label: { equals: label } } })

  const apiKey = crypto.randomUUID()

  await payload.create({
    collection: 'payload-mcp-api-keys',
    data: {
      user: user.id,
      label,
      enableAPIKey: true,
      apiKey,
      caseStudies: contentRights,
      notes: contentRights,
      albums: contentRights,
      experiences: contentRights,
      skills: contentRights,
      expertises: contentRights,
      media: { find: true },
      profile: { find: true, update: true },
      siteSettings: { find: true, update: true },
      'payload-mcp-tool': { writeRichText: true },
    },
  })

  return apiKey
}
