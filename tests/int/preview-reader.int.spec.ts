// @vitest-environment node
// jose (Payload's JWT library) rejects jsdom's Buffer, which comes from another realm.
import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getReader } from '@/lib/content'
import type { User } from '@/payload-types'

import { createMcpKey } from '../helpers/mcpKey'
import { createAdmin, testPayload } from '../helpers/payload'

// What the request carries: Next's draft-mode cookie, and maybe a Payload session or an API key.
const request = vi.hoisted(() => ({ draft: false, headers: new Headers() }))

vi.mock('next/headers', () => ({
  draftMode: async () => ({ isEnabled: request.draft }),
  headers: async () => request.headers,
}))

let payload: Payload
let admin: User

describe('preview reader', () => {
  // The key references the user: it has to go first, or deleting the user fails.
  const removeKey = () =>
    payload.delete({
      collection: 'payload-mcp-api-keys',
      where: { label: { equals: 'preview-reader' } },
    })

  beforeAll(async () => {
    payload = await testPayload()
    await removeKey()
    admin = await createAdmin(payload, 'preview-reader@test.local')
  })

  afterAll(async () => {
    await removeKey()
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  beforeEach(() => {
    request.draft = false
    request.headers = new Headers()
  })

  it('reads published content outside preview, even for the admin', async () => {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: admin.email, password: `${admin.email}-password` },
    })
    request.headers = new Headers({
      cookie: `payload-token=${token}`,
      'sec-fetch-site': 'same-origin',
    })

    expect(await getReader()).toEqual({ draft: false })
  })

  it('shows no draft with the preview cookie alone', async () => {
    request.draft = true

    expect(await getReader()).toEqual({ draft: false })
  })

  it('shows no draft to an MCP API key', async () => {
    const key = await createMcpKey(payload, admin, 'preview-reader')
    request.draft = true
    request.headers = new Headers({ authorization: `payload-mcp-api-keys API-Key ${key}` })

    expect(await getReader()).toEqual({ draft: false })
  })

  // Payload only trusts the session cookie on same-origin requests (CSRF): a browser sends
  // `Sec-Fetch-Site: same-origin` when the admin opens the preview, or `none` for a typed URL.
  it('shows drafts to the signed-in admin in preview', async () => {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: admin.email, password: `${admin.email}-password` },
    })
    request.draft = true
    request.headers = new Headers({
      cookie: `payload-token=${token}`,
      'sec-fetch-site': 'same-origin',
    })

    expect(await getReader()).toMatchObject({ draft: true, user: { id: admin.id } })
  })

  it('shows no draft to a cross-site request carrying the session cookie', async () => {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: admin.email, password: `${admin.email}-password` },
    })
    request.draft = true
    request.headers = new Headers({
      cookie: `payload-token=${token}`,
      'sec-fetch-site': 'cross-site',
    })

    expect(await getReader()).toEqual({ draft: false })
  })
})
