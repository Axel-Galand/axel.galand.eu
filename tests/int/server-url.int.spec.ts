import { describe, expect, it } from 'vitest'

import { getServerURL, serverURLProblem } from '@/lib/serverURL'

describe('getServerURL', () => {
  it('falls back to localhost when unset', () => {
    expect(getServerURL({})).toBe('http://localhost:3000')
  })

  it.each(['https://axel.galand.eu', 'https://axel.galand.eu/', ' https://axel.galand.eu/admin '])(
    'reduces %j to its origin',
    (value) => {
      expect(getServerURL({ SERVER_URL: value })).toBe('https://axel.galand.eu')
    },
  )
})

describe('serverURLProblem', () => {
  const production = { NODE_ENV: 'production' }

  it('accepts an https URL in production', () => {
    expect(serverURLProblem({ ...production, SERVER_URL: 'https://axel.galand.eu' })).toBeNull()
  })

  it('accepts http on localhost, for local image runs', () => {
    expect(serverURLProblem({ ...production, SERVER_URL: 'http://localhost:3200' })).toBeNull()
  })

  it.each([undefined, '', 'axel.galand.eu', 'http://axel.galand.eu'])(
    'flags %j in production',
    (value) => {
      expect(serverURLProblem({ ...production, SERVER_URL: value })).not.toBeNull()
    },
  )

  it('ignores SERVER_URL outside production', () => {
    expect(serverURLProblem({ NODE_ENV: 'development' })).toBeNull()
  })
})
