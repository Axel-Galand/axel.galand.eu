import { describe, expect, it } from 'vitest'

import { isIndexable } from '@/lib/seo/indexing'

describe('isIndexable', () => {
  it('is true only for the exact value "true"', () => {
    expect(isIndexable({ SITE_INDEXABLE: 'true' })).toBe(true)
  })

  it.each([undefined, '', 'false', 'TRUE', '1', 'yes', ' true'])('fails closed for %j', (value) => {
    expect(isIndexable({ SITE_INDEXABLE: value })).toBe(false)
  })
})
