import { describe, expect, it } from 'vitest'

import { isFirstUserRouteBlocked } from '@/lib/security/firstUser'

const production = { NODE_ENV: 'production' }

describe('isFirstUserRouteBlocked', () => {
  it.each([
    '/admin/create-first-user',
    '/admin/create-first-user/',
    '/Admin/Create-First-User',
    '/admin/create%2Dfirst-user',
    '/api/users/first-register',
    '/api/users/first-register/',
  ])('blocks %s in production', (pathname) => {
    expect(isFirstUserRouteBlocked(pathname, production)).toBe(true)
  })

  it.each(['/admin', '/admin/login', '/api/users/login', '/api/users/me', '/'])(
    'leaves %s alone',
    (pathname) => {
      expect(isFirstUserRouteBlocked(pathname, production)).toBe(false)
    },
  )

  it('opens the routes only for ALLOW_FIRST_USER=true', () => {
    expect(
      isFirstUserRouteBlocked('/api/users/first-register', {
        ...production,
        ALLOW_FIRST_USER: 'true',
      }),
    ).toBe(false)
    expect(
      isFirstUserRouteBlocked('/api/users/first-register', {
        ...production,
        ALLOW_FIRST_USER: '1',
      }),
    ).toBe(true)
  })

  it('never blocks outside production', () => {
    expect(isFirstUserRouteBlocked('/admin/create-first-user', { NODE_ENV: 'development' })).toBe(
      false,
    )
  })
})
