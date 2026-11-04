import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import config from '@/payload.config'
import type { User } from '@/payload-types'

let instance: Payload | undefined

export const testPayload = async (): Promise<Payload> => {
  instance ??= await getPayload({ config: await config })

  return instance
}

/** A fresh admin account, so tests never depend on each other's users. */
export const createAdmin = async (payload: Payload, email: string): Promise<User> => {
  await payload.delete({ collection: 'users', where: { email: { equals: email } } })

  return payload.create({
    collection: 'users',
    data: { email, password: `${email}-password` },
  })
}

/** A request as the MCP endpoint builds it: the key's linked user and `payloadAPI: 'MCP'`. */
export const mcpRequest = async (payload: Payload, user: User): Promise<PayloadRequest> => {
  const req = await createLocalReq({ user: { ...user, collection: 'users' } }, payload)
  req.payloadAPI = 'MCP'

  return req
}

/** What `req.user` is when the MCP key is used as a REST API key: the key doc itself. */
export const apiKeyDocUser = (id: number) =>
  ({ id, collection: 'payload-mcp-api-keys' }) as unknown as User

export const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      },
    ],
  },
})
