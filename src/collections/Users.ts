import type { Access, CollectionConfig } from 'payload'

const selfOnly: Access = ({ req: { user } }) => (user ? { id: { equals: user.id } } : false)

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
