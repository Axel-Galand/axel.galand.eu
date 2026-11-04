import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublished, findPublishedGlobal } from '@/lib/content'
import type { User } from '@/payload-types'

import { apiKeyDocUser, createAdmin, testPayload } from '../helpers/payload'

let payload: Payload
let admin: User
const marker = `access-${Date.now()}`
const createdIds: number[] = []

const caseStudy = (title: string) => ({
  title,
  slug: `${marker}-${title.toLowerCase().replace(/\W+/g, '-')}`,
  summary: 'Résumé',
  sector: 'Secteur anonymisé',
  period: { start: '2024-01-01T00:00:00.000Z' },
})

describe('content access', () => {
  beforeAll(async () => {
    payload = await testPayload()
    admin = await createAdmin(payload, 'content-access@test.local')
  })

  afterAll(async () => {
    await payload.delete({ collection: 'case-studies', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'case-studies', where: { id: { in: createdIds } } })
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  it('never shows a document that was only ever saved as a draft', async () => {
    await payload.create({
      collection: 'case-studies',
      data: caseStudy('Never published'),
      draft: true,
    })

    const anonymous = await payload.find({
      collection: 'case-studies',
      where: { slug: { like: marker } },
      overrideAccess: false,
    })
    const helper = await findPublished({
      collection: 'case-studies',
      where: { slug: { like: marker } },
      locale: 'fr',
    })

    expect(anonymous.docs).toHaveLength(0)
    expect(helper.docs).toHaveLength(0)
  })

  it('keeps showing the published version while a newer draft exists', async () => {
    const doc = await payload.create({
      collection: 'case-studies',
      data: { ...caseStudy('Live'), _status: 'published' },
    })

    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      data: { title: 'Live, edited in a draft' },
      draft: true,
    })

    const { docs } = await findPublished({
      collection: 'case-studies',
      where: { id: { equals: doc.id } },
      locale: 'fr',
    })

    expect(docs.map((d) => d.title)).toEqual(['Live'])
  })

  it('lets the admin see drafts', async () => {
    const { docs } = await payload.find({
      collection: 'case-studies',
      where: { slug: { like: marker } },
      overrideAccess: false,
      user: admin,
      draft: true,
    })

    expect(docs.length).toBeGreaterThanOrEqual(2)
  })

  it('refuses writes from an MCP API key used as a REST API key', async () => {
    await expect(
      payload.create({
        collection: 'case-studies',
        data: caseStudy('Through REST key'),
        overrideAccess: false,
        user: apiKeyDocUser(admin.id),
      }),
    ).rejects.toThrow()

    await expect(
      payload.find({ collection: 'users', overrideAccess: false, user: apiKeyDocUser(admin.id) }),
    ).rejects.toThrow()
  })

  it('falls back to French when the English version is missing', async () => {
    const doc = await payload.create({
      collection: 'case-studies',
      data: { ...caseStudy('Seulement en français'), _status: 'published' },
      locale: 'fr',
    })

    const { docs } = await findPublished({
      collection: 'case-studies',
      where: { id: { equals: doc.id } },
      locale: 'en',
    })

    expect(docs[0]?.title).toBe('Seulement en français')
  })

  it('derives the slug from the title and refuses duplicates', async () => {
    const title = `${marker} Été à Bordeaux`
    const doc = await payload.create({
      collection: 'case-studies',
      data: { ...caseStudy('x'), title, slug: undefined },
      draft: true,
    })

    expect(doc.slug).toBe(`${marker}-ete-a-bordeaux`)

    await expect(
      payload.create({
        collection: 'case-studies',
        data: { ...caseStudy('y'), title, slug: undefined },
        draft: true,
      }),
    ).rejects.toThrow()
  })

  it('hides a draft-only global from anonymous reads', async () => {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { defaultTitle: 'Publié', defaultDescription: 'Publié', _status: 'published' },
    })
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { defaultTitle: 'Brouillon' },
      draft: true,
    })

    const settings = await findPublishedGlobal({ slug: 'site-settings', locale: 'fr' })
    const anonymousDraft = await payload.findGlobal({
      slug: 'site-settings',
      draft: true,
      overrideAccess: false,
    })

    expect(settings.defaultTitle).toBe('Publié')
    expect(anonymousDraft.defaultTitle).toBe('Publié')
  })

  it('only derives the slug from a French title', async () => {
    const doc = await payload.create({
      collection: 'case-studies',
      data: { ...caseStudy('x'), slug: undefined, title: `${marker} English first` },
      locale: 'en',
      draft: true,
    })
    createdIds.push(doc.id)

    expect(doc.slug ?? null).toBeNull()
  })

  it('never stores an empty slug, and refuses to publish without one', async () => {
    const draft = await payload.create({
      collection: 'case-studies',
      data: { ...caseStudy('x'), slug: undefined, title: '!!!' },
      draft: true,
    })
    createdIds.push(draft.id)

    expect(draft.slug ?? null).toBeNull()
    await expect(
      payload.create({
        collection: 'case-studies',
        data: { ...caseStudy('x'), slug: '', title: '???', _status: 'published' },
      }),
    ).rejects.toThrow()
  })

  it('lists media for the Local API but not for an anonymous REST call', async () => {
    await expect(
      payload.find({ collection: 'media', overrideAccess: false, limit: 1 }),
    ).resolves.toBeDefined()

    await expect(
      payload.find({
        collection: 'media',
        overrideAccess: false,
        req: { payloadAPI: 'REST' },
      }),
    ).rejects.toThrow()
  })

  it('keeps versions (drafts) away from anyone but an admin', async () => {
    await expect(
      payload.findVersions({ collection: 'case-studies', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.findVersions({
        collection: 'case-studies',
        overrideAccess: false,
        user: apiKeyDocUser(admin.id),
      }),
    ).rejects.toThrow()
    await expect(
      payload.findVersions({ collection: 'case-studies', overrideAccess: false, user: admin }),
    ).resolves.toBeDefined()
  })
})
