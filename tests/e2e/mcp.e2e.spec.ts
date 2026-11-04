import { expect, test, type APIRequestContext } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import type { User } from '../../src/payload-types.js'
import { createMcpKey } from '../helpers/mcpKey'
import { createAdmin, paragraph } from '../helpers/payload'
import { serverURL } from '../helpers/serverURL'

const marker = `e2e-mcp-${Date.now()}`
let payload: Payload
let admin: User
let key: string

// Streamable HTTP: one JSON-RPC call per POST, the answer comes back as an SSE `data:` line.
const call = async (request: APIRequestContext, method: string, params: object, auth = key) => {
  const response = await request.post(`${serverURL}/api/mcp`, {
    headers: {
      Authorization: `Bearer ${auth}`,
      Accept: 'application/json, text/event-stream',
    },
    data: { jsonrpc: '2.0', id: 1, method, params },
  })
  const body = await response.text()
  const data = body.split('\n').find((line) => line.startsWith('data: '))

  return { status: response.status(), json: data ? JSON.parse(data.slice(6)) : undefined }
}

const publicNotes = async (request: APIRequestContext) =>
  (await (await request.get(`${serverURL}/api/notes?where[slug][like]=${marker}`)).json()).totalDocs

test.describe('MCP endpoint', () => {
  test.beforeAll(async () => {
    payload = await getPayload({ config })
    admin = await createAdmin(payload, 'e2e-mcp@test.local')
    key = await createMcpKey(payload, admin, 'e2e')
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'notes', where: { slug: { like: marker } } })
    await payload.delete({
      collection: 'payload-mcp-api-keys',
      where: { label: { equals: 'e2e' } },
    })
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  test('refuses a request without a valid key', async ({ request }) => {
    const { status } = await call(request, 'tools/list', {}, 'not-a-key')

    expect(status).toBe(401)
  })

  test('exposes no delete tool', async ({ request }) => {
    const { json } = await call(request, 'tools/list', {})
    const names: string[] = json.result.tools.map((tool: { name: string }) => tool.name)

    expect(names).toContain('createNotes')
    expect(names).toContain('writeRichText')
    expect(names.some((name) => name.startsWith('delete'))).toBe(false)
  })

  test('turns a create that asks to publish into a draft', async ({ request }) => {
    await call(request, 'tools/call', {
      name: 'createNotes',
      arguments: {
        title: `${marker} created`,
        slug: `${marker}-created`,
        excerpt: 'Chapô',
        body: paragraph('Corps'),
        _status: 'published',
        draft: false,
        locale: 'fr',
      },
    })

    const created = await payload.find({
      collection: 'notes',
      where: { slug: { equals: `${marker}-created` } },
      draft: true,
    })

    expect(created.docs[0]?._status).toBe('draft')
    expect(await publicNotes(request)).toBe(0)
  })

  test('keeps a bulk update that asks to publish as drafts', async ({ request }) => {
    await call(request, 'tools/call', {
      name: 'updateNotes',
      arguments: {
        where: JSON.stringify({ slug: { like: marker } }),
        title: `${marker} bulk`,
        _status: 'published',
        draft: false,
      },
    })

    expect(await publicNotes(request)).toBe(0)
  })

  test('refuses the MCP key used as a REST API key', async ({ request }) => {
    const response = await request.post(`${serverURL}/api/notes`, {
      headers: { Authorization: `payload-mcp-api-keys API-Key ${key}` },
      data: { title: 'x', excerpt: 'x', body: paragraph('x') },
    })

    expect(response.status()).toBe(403)
  })
})
