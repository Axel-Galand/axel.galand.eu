import type { Access, CollectionConfig } from 'payload'

import { isAdminUser } from '@/access'

// The collection check matters: an MCP API-key doc can share its numeric id with a user.
const selfOnly: Access = ({ req: { user } }) =>
  user && isAdminUser(user) ? { id: { equals: user.id } } : false

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    // Single-account site: the account comes from the first-user screen, nobody can add another.
    create: () => false,
    delete: () => false,
    read: selfOnly,
    update: selfOnly,
  },
  fields: [
    // Email added by default
  ],
}
