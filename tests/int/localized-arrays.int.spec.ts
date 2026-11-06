import type { MigrateUpArgs } from '@payloadcms/db-sqlite'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { up } from '@/migrations/20261106_102557_localized_arrays'

import type { User } from '@/payload-types'

import { createAdmin, mcpRequest, testPayload } from '../helpers/payload'

let payload: Payload
let admin: User
const marker = `arrays-${Date.now()}`

// The MCP writes one language at a time and sends array rows without their ids. Each language must
// keep its own rows: with only the texts localized, writing English erased the French ones.
describe('arrays written one language at a time', () => {
  beforeAll(async () => {
    payload = await testPayload()
    admin = await createAdmin(payload, 'localized-arrays@test.local')
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
    await payload.delete({ collection: 'experiences', where: { organization: { equals: marker } } })
    await payload.delete({ collection: 'case-studies', where: { slug: { like: marker } } })
  })

  it('keeps the French highlights of an experience', async () => {
    const doc = await payload.create({
      collection: 'experiences',
      locale: 'fr',
      draft: true,
      data: {
        kind: 'job',
        organization: marker,
        role: 'Rôle',
        start: '2022-09-01T00:00:00.000Z',
        highlights: [{ text: 'Un' }, { text: 'Deux' }],
      },
    })
    await payload.update({
      collection: 'experiences',
      id: doc.id,
      locale: 'en',
      draft: true,
      data: { role: 'Role', highlights: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }] },
    })
    const read = async (locale: 'fr' | 'en') =>
      (
        await payload.findByID({
          collection: 'experiences',
          id: doc.id,
          locale,
          draft: true,
          fallbackLocale: false,
        })
      ).highlights?.map(({ text }) => text)

    expect(await read('fr')).toEqual(['Un', 'Deux'])
    expect(await read('en')).toEqual(['One', 'Two', 'Three'])
  })

  // Each array row has one primary key for both languages: English rows sent back with the French
  // row ids (as a copy from `find` would) made the publish fail and empty the array.
  it('publishes English rows that Claude sent with the French row ids', async () => {
    const req = await mcpRequest(payload, admin)
    const doc = await payload.create({
      collection: 'experiences',
      locale: 'fr',
      data: {
        kind: 'job',
        organization: marker,
        role: 'Rôle',
        start: '2022-09-01T00:00:00.000Z',
        highlights: [{ text: 'Un' }],
      },
      req,
      user: admin,
      overrideAccess: false,
    })
    const frenchRows = doc.highlights ?? []

    await payload.update({
      collection: 'experiences',
      id: doc.id,
      locale: 'en',
      data: { role: 'Role', highlights: frenchRows.map((row) => ({ ...row, text: 'One' })) },
      req,
      user: admin,
      overrideAccess: false,
    })
    // The admin publishes.
    await payload.update({ collection: 'experiences', id: doc.id, data: { _status: 'published' } })

    const read = async (locale: 'fr' | 'en') =>
      (
        await payload.findByID({
          collection: 'experiences',
          id: doc.id,
          locale,
          fallbackLocale: false,
        })
      ).highlights?.map(({ text }) => text)

    expect(await read('fr')).toEqual(['Un'])
    expect(await read('en')).toEqual(['One'])
  })

  it('keeps the French metrics of a case study', async () => {
    const doc = await payload.create({
      collection: 'case-studies',
      locale: 'fr',
      draft: true,
      data: {
        title: 'Chiffres',
        slug: `${marker}-metrics`,
        summary: 'Résumé',
        sector: 'Secteur',
        period: { start: '2024-01-01T00:00:00.000Z' },
        metrics: [{ value: '5', label: 'pays' }],
      },
    })
    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      locale: 'en',
      draft: true,
      data: { title: 'Metrics', metrics: [{ value: '5', label: 'countries' }] },
    })
    const read = async (locale: 'fr' | 'en') =>
      (
        await payload.findByID({
          collection: 'case-studies',
          id: doc.id,
          locale,
          draft: true,
          fallbackLocale: false,
        })
      ).metrics?.map(({ value, label }) => `${value} ${label}`)

    expect(await read('fr')).toEqual(['5 pays'])
    expect(await read('en')).toEqual(['5 countries'])
  })

  it('keeps the French languages of the profile, and shares its links', async () => {
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'fr',
      draft: true,
      data: {
        links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/example' }],
        languages: [{ language: 'Anglais', level: 'Courant' }],
      },
    })
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      draft: true,
      data: { languages: [{ language: 'English', level: 'Fluent' }] },
    })
    const read = async (locale: 'fr' | 'en') => {
      const profile = await payload.findGlobal({
        slug: 'profile',
        locale,
        draft: true,
        fallbackLocale: false,
      })

      return {
        links: profile.links?.map(({ url }) => url),
        languages: profile.languages?.map(({ language, level }) => `${language} ${level}`),
      }
    }

    expect(await read('fr')).toEqual({
      links: ['https://github.com/example'],
      languages: ['Anglais Courant'],
    })
    expect(await read('en')).toEqual({
      links: ['https://github.com/example'],
      languages: ['English Fluent'],
    })
  })
})

describe('localized_arrays migration', () => {
  // Without transactions, a failure after the drops would lose texts: it must refuse to start.
  it('changes nothing when an array already has rows', async () => {
    const db = { get: vi.fn(async () => ({ n: 2 })), run: vi.fn() }

    await expect(up({ db } as unknown as MigrateUpArgs)).rejects.toThrow(
      'only runs on empty arrays',
    )
    expect(db.run).not.toHaveBeenCalled()
  })
})
