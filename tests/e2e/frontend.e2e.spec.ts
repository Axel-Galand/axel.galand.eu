import { test, expect } from '@playwright/test'

import { serverURL as baseURL } from '../helpers/serverURL'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto(baseURL)

    // Other specs may publish a profile meanwhile: only the first name is stable.
    await expect(page.locator('h1').first()).toContainText('Axel')
  })

  test('stays noindex while SITE_INDEXABLE is not "true"', async ({ page }) => {
    const response = await page.goto(baseURL)

    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })

  test('robots.txt allows crawling so the noindex stays visible', async ({ request }) => {
    const response = await request.get(`${baseURL}/robots.txt`)
    const body = await response.text()

    expect(response.ok()).toBe(true)
    expect(body).toContain('Allow: /')
    expect(body).not.toContain('Disallow')
  })

  test('healthz reports the database as reachable', async ({ request }) => {
    const response = await request.get(`${baseURL}/healthz`)

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })
})
