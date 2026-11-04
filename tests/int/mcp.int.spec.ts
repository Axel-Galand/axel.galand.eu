import type { Payload, PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { writeRichTextTool } from '@/mcp/writeRichText'
import type { User } from '@/payload-types'

import { createAdmin, mcpRequest, paragraph, testPayload } from '../helpers/payload'

let payload: Payload
let admin: User
let req: PayloadRequest
const marker = `mcp-${Date.now()}`

const note = (title: string) => ({
  title,
  slug: `${marker}-${title.toLowerCase().replace(/\W+/g, '-')}`,
  excerpt: 'Chapô',
  body: paragraph('Corps'),
})

const anonymousCount = async () =>
  (
    await payload.find({
      collection: 'notes',
      where: { slug: { like: marker } },
      overrideAccess: false,
    })
  ).totalDocs

describe('writes through MCP', () => {
  beforeAll(async () => {
    payload = await testPayload()
    admin = await createAdmin(payload, 'mcp@test.local')
    req = await mcpRequest(payload, admin)
  })

  afterAll(async () => {
    await payload.delete({ collection: 'notes', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  it('saves a create as a draft even when it asks to publish', async () => {
    const doc = await payload.create({
      collection: 'notes',
      data: { ...note('Asks to publish'), _status: 'published' },
      req,
      user: admin,
      overrideAccess: false,
    })

    expect(doc._status).toBe('draft')
    expect(await anonymousCount()).toBe(0)
  })

  it('leaves the live version untouched when it updates a published document', async () => {
    const live = await payload.create({
      collection: 'notes',
      data: { ...note('Live note'), _status: 'published' },
    })

    await payload.update({
      collection: 'notes',
      id: live.id,
      data: { title: 'Rewritten by Claude', _status: 'published' },
      draft: false,
      req,
      user: admin,
      overrideAccess: false,
    })

    const published = await payload.findByID({ collection: 'notes', id: live.id, draft: false })
    const latest = await payload.findByID({ collection: 'notes', id: live.id, draft: true })

    expect(published.title).toBe('Live note')
    expect(published._status).toBe('published')
    expect(latest.title).toBe('Rewritten by Claude')
  })

  it('refuses deletes', async () => {
    const doc = await payload.create({ collection: 'notes', data: note('Keep me'), draft: true })

    await expect(
      payload.delete({ collection: 'notes', id: doc.id, req, user: admin, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('keeps a global update as a draft', async () => {
    await payload.updateGlobal({
      slug: 'profile',
      data: { name: 'Axel Galand', headline: 'Accroche publiée', _status: 'published' },
    })

    await payload.updateGlobal({
      slug: 'profile',
      data: { headline: 'Accroche de Claude', _status: 'published' },
      req,
      user: admin,
      overrideAccess: false,
    })

    const published = await payload.findGlobal({ slug: 'profile', draft: false })

    expect(published.headline).toBe('Accroche publiée')
  })

  describe('writeRichText', () => {
    it('converts Markdown, including a fenced code block, into a draft', async () => {
      const doc = await payload.create({
        collection: 'notes',
        data: note('Rich text'),
        draft: true,
      })

      const result = await writeRichTextTool.handler(
        {
          target: 'notes',
          id: doc.id,
          field: 'body',
          locale: 'fr',
          markdown: '## Titre\n\nUn paragraphe avec **du gras**.\n\n```ts\nconst a = 1\n```\n',
        },
        req,
      )

      const saved = await payload.findByID({ collection: 'notes', id: doc.id, draft: true })
      const nodes = saved.body.root.children as Array<Record<string, unknown>>
      const code = nodes.find((node) => node.type === 'block') as
        { fields: { blockType: string; language: string; code: string } } | undefined

      expect(result.content[0]?.text).toContain('as a draft')
      expect(nodes[0]).toMatchObject({ type: 'heading', tag: 'h2' })
      expect(code?.fields).toMatchObject({ blockType: 'Code', language: 'ts', code: 'const a = 1' })
      expect(saved._status).toBe('draft')
    })

    it('refuses a field that is not on its list', async () => {
      const doc = await payload.create({
        collection: 'notes',
        data: note('Wrong field'),
        draft: true,
      })

      await expect(
        writeRichTextTool.handler(
          { target: 'notes', id: doc.id, field: 'excerpt', locale: 'fr', markdown: 'x' },
          req,
        ),
      ).rejects.toThrow(/only accepts/)
    })

    it('writes the profile bio as a draft', async () => {
      await writeRichTextTool.handler(
        { target: 'profile', field: 'bio', locale: 'en', markdown: 'Hello **there**.' },
        req,
      )

      const draft = await payload.findGlobal({ slug: 'profile', draft: true, locale: 'en' })
      const published = await payload.findGlobal({ slug: 'profile', draft: false, locale: 'en' })

      expect(JSON.stringify(draft.bio)).toContain('there')
      expect(JSON.stringify(published.bio ?? null)).not.toContain('there')
    })
  })
})
