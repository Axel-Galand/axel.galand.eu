import type { Access, PayloadRequest } from 'payload'

/**
 * Only a signed-in account of the `users` collection counts. The MCP plugin's API-key collection
 * also has API-key auth, so the same key would otherwise pass any `Boolean(user)` check on the
 * REST API, skipping the MCP permissions and the forced drafts.
 */
export const isAdminUser = (user: PayloadRequest['user']): boolean => user?.collection === 'users'

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => isAdminUser(user)

/**
 * Anonymous visitors only ever see published documents: a draft, or a document that has never
 * been published, stays invisible until it is published from the admin.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) =>
  isAdminUser(user) ? true : { _status: { equals: 'published' } }
