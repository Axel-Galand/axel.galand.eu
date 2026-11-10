import type { Payload, PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublic, type Reader } from '@/lib/content'
import type { User } from '@/payload-types'

import { createAdmin, mcpRequest, testPayload } from '../helpers/payload'

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
})
