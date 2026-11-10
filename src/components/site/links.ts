import type { Profile } from '@/payload-types'

type ProfileLink = NonNullable<Profile['links']>[number]

export const linkLabel = (link: ProfileLink): string =>
  link.label ||
  (link.kind === 'linkedin' ? 'LinkedIn' : link.kind === 'github' ? 'GitHub' : link.url)
