import type { Payload, PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublic, type Reader } from '@/lib/content'
import type { User } from '@/payload-types'

import { createAdmin, mcpRequest, paragraph, testPayload } from '../helpers/payload'

let payload: Payload
let admin: User
let req: PayloadRequest
const marker = `expertise-${Date.now()}`
const visitor: Reader = { draft: false }

const expertise = (name: string) => ({
  name: `${marker} ${name}`,
  version: '16',
  category: 'front' as const,
  description: 'Ce que j’en fais',
})

const mine = { name: { like: marker } }

describe('expertises', () => {
  beforeAll(async () => {
    payload = await testPayload()
    admin = await createAdmin(payload, 'expertises@test.local')
    req = await mcpRequest(payload, admin)
  })

  afterAll(async () => {
    await payload.delete({ collection: 'expertises', where: mine })
    await payload.delete({ collection: 'case-studies', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'notes', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  it('keeps a draft away from visitors', async () => {
    await payload.create({ collection: 'expertises', data: expertise('Draft'), draft: true })

    const anonymous = await payload.find({
      collection: 'expertises',
      where: mine,
      overrideAccess: false,
    })
    const helper = await findPublic({
      collection: 'expertises',
      where: mine,
      locale: 'fr',
      reader: visitor,
    })

    expect(anonymous.docs).toHaveLength(0)
    expect(helper.docs).toHaveLength(0)
  })

  it('is absent from English until its English text exists', async () => {
    const doc = await payload.create({
      collection: 'expertises',
      locale: 'fr',
      data: { ...expertise('Bilingual'), _status: 'published' },
    })
    const english = () =>
      findPublic({
        collection: 'expertises',
        where: { id: { equals: doc.id } },
        locale: 'en',
        reader: visitor,
      })

    expect((await english()).docs).toHaveLength(0)

    await payload.update({
      collection: 'expertises',
      id: doc.id,
      locale: 'en',
      data: { description: 'What I do with it', _status: 'published' },
    })

    expect((await english()).docs.map((item) => item.description)).toEqual(['What I do with it'])
  })

  it('takes MCP writes as drafts, and refuses MCP deletes', async () => {
    const doc = await payload.create({
      collection: 'expertises',
      data: { ...expertise('Through MCP'), _status: 'published' },
      req,
      user: admin,
      overrideAccess: false,
    })

    expect(doc._status).toBe('draft')
    await expect(
      payload.delete({
        collection: 'expertises',
        id: doc.id,
        req,
        user: admin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
  it('never lets a linked draft or untranslated document through', async () => {
    const draft = await payload.create({
      collection: 'case-studies',
      draft: true,
      data: {
        title: 'Étude en brouillon',
        slug: `${marker}-draft-study`,
        summary: 'Résumé',
        sector: 'Secteur',
        period: { start: '2024-01-01T00:00:00.000Z' },
      },
    })
    const frenchOnly = await payload.create({
      collection: 'notes',
      locale: 'fr',
      data: {
        title: 'Note en français',
        slug: `${marker}-fr-note`,
        excerpt: 'Chapô',
        body: paragraph('Corps'),
        _status: 'published',
      },
    })
    const doc = await payload.create({
      collection: 'expertises',
      locale: 'fr',
      data: {
        ...expertise('Linked'),
        caseStudies: [draft.id],
        notes: [frenchOnly.id],
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'expertises',
      id: doc.id,
      locale: 'en',
      data: { description: 'Linked in English', _status: 'published' },
    })

    const read = async (locale: 'fr' | 'en') =>
      (
        await findPublic({
          collection: 'expertises',
          where: { id: { equals: doc.id } },
          locale,
          depth: 1,
          reader: visitor,
        })
      ).docs[0]

    const french = await read('fr')
    const english = await read('en')

    // The draft study stays an id, never a populated document, in both languages.
    expect(french.caseStudies).toEqual([draft.id])
    expect(english.caseStudies).toEqual([draft.id])
    // The note is populated in French, and has no title in English (no fallback): pages skip it.
    expect(french.notes?.map((note) => typeof note === 'object' && note.title)).toEqual([
      'Note en français',
    ])
    expect(english.notes?.map((note) => typeof note === 'object' && Boolean(note.title))).toEqual([
      false,
    ])
  })
})
