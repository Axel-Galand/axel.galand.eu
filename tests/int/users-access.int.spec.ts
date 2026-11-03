import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

let payload: Payload
let owner: User
let other: User

const emails = ['owner@access.test', 'other@access.test']

describe('users access', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.delete({ collection: 'users', where: { email: { in: emails } } })

    owner = await payload.create({
      collection: 'users',
      data: { email: emails[0], password: 'owner-password' },
    })
    other = await payload.create({
      collection: 'users',
      data: { email: emails[1], password: 'other-password' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { email: { in: emails } } })
  })

  it('refuses anonymous reads', async () => {
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })

  it('refuses account creation, even for a signed-in user', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: 'intruder@access.test', password: 'intruder-password' },
        overrideAccess: false,
        user: owner,
      }),
    ).rejects.toThrow()
  })

  it('lets a user read only their own account', async () => {
    const result = await payload.find({ collection: 'users', overrideAccess: false, user: owner })

    expect(result.docs.map((doc) => doc.id)).toEqual([owner.id])
  })

  it('refuses updating another account', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: other.id,
        data: { email: 'hijacked@access.test' },
        overrideAccess: false,
        user: owner,
      }),
    ).rejects.toThrow()
  })

  it('refuses deleting an account', async () => {
    await expect(
      payload.delete({ collection: 'users', id: owner.id, overrideAccess: false, user: owner }),
    ).rejects.toThrow()
  })
})
