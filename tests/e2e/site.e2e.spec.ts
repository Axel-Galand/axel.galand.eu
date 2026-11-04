import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { createAdmin, paragraph } from '../helpers/payload'
import { serverURL } from '../helpers/serverURL'

const marker = `e2e-site-${Date.now()}`
const slugs = { study: `${marker}-etude`, draft: `${marker}-brouillon`, note: `${marker}-note` }
const adminEmail = 'e2e-site@test.local'
let payload: Payload

const studyData = (title: string) => ({
  title,
  summary: 'Résumé e2e',
  sector: 'Secteur e2e',
  period: { start: '2024-01-01T00:00:00.000Z' },
  context: paragraph('Contexte e2e'),
})

test.describe('public site', () => {
  // A French browser: in English, the home page rightly redirects to /en.
  test.use({ locale: 'fr-FR' })

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    await createAdmin(payload, adminEmail)

    const study = await payload.create({
      collection: 'case-studies',
      locale: 'fr',
      data: { ...studyData('Étude e2e'), slug: slugs.study, featured: true, _status: 'published' },
    })
    await payload.update({
      collection: 'case-studies',
      id: study.id,
      locale: 'en',
      data: {
        ...studyData('E2E study'),
        summary: 'E2E summary',
        sector: 'E2E sector',
        _status: 'published',
      },
    })
    await payload.create({
      collection: 'case-studies',
      locale: 'fr',
      data: { ...studyData('Brouillon e2e'), slug: slugs.draft },
      draft: true,
    })
    // French only: it must not exist under /en.
    await payload.create({
      collection: 'notes',
      locale: 'fr',
      data: {
        title: 'Note e2e',
        slug: slugs.note,
        excerpt: 'Chapô e2e',
        body: paragraph('Corps e2e'),
        publishedAt: '2026-01-15T00:00:00.000Z',
        _status: 'published',
      },
    })
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'fr',
      data: { name: 'Axel Galand (e2e)', headline: 'Accroche e2e', _status: 'published' },
    })
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: { headline: 'E2E headline', _status: 'published' },
    })
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'case-studies', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'notes', where: { slug: { like: marker } } })
    await payload.delete({ collection: 'users', where: { email: { equals: adminEmail } } })
  })

  test('serves each page in its language, with only the translations that exist', async ({
    page,
  }) => {
    await page.goto(`${serverURL}/`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.locator('h1')).toHaveText('Axel Galand (e2e)')

    await page.goto(`${serverURL}/en/projects`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('link', { name: 'E2E study' })).toHaveAttribute(
      'href',
      `/en/projects/${slugs.study}`,
    )

    await page.goto(`${serverURL}/projets/${slugs.study}`)
    await expect(page.locator('h1')).toHaveText('Étude e2e')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${serverURL}/projets/${slugs.study}`,
    )
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      `${serverURL}/en/projects/${slugs.study}`,
    )
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${serverURL}/projets/${slugs.study}`,
    )

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.map((text) => JSON.parse(text)['@type'])).toEqual([
      'CreativeWork',
      'BreadcrumbList',
    ])
  })

  test('keeps a French-only note out of English', async ({ page, request }) => {
    expect((await request.get(`${serverURL}/en/notes/${slugs.note}`)).status()).toBe(404)

    await page.goto(`${serverURL}/notes/${slugs.note}`)
    await expect(page.locator('h1')).toHaveText('Note e2e')
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(0)

    await page.goto(`${serverURL}/en/notes`)
    await expect(page.getByText('Note e2e')).toHaveCount(0)
  })

  test('never shows a draft to visitors', async ({ request }) => {
    expect((await request.get(`${serverURL}/projets/${slugs.draft}`)).status()).toBe(404)
    expect(await (await request.get(`${serverURL}/sitemap.xml`)).text()).not.toContain(slugs.draft)
  })

  test('lists published documents in the sitemap, per translation', async ({ request }) => {
    const sitemap = await (await request.get(`${serverURL}/sitemap.xml`)).text()

    expect(sitemap).toContain(`<loc>${serverURL}/projets/${slugs.study}</loc>`)
    expect(sitemap).toContain(`<loc>${serverURL}/en/projects/${slugs.study}</loc>`)
    expect(sitemap).toContain(`hreflang="en" href="${serverURL}/en/projects/${slugs.study}"`)
    expect(sitemap).toContain(`<loc>${serverURL}/notes/${slugs.note}</loc>`)
    expect(sitemap).not.toContain(`/en/notes/${slugs.note}`)
  })

  test('publishes an RSS feed per language', async ({ request }) => {
    const fr = await request.get(`${serverURL}/notes/rss.xml`)
    const en = await request.get(`${serverURL}/en/notes/rss.xml`)

    expect(fr.headers()['content-type']).toContain('application/rss+xml')
    expect(await fr.text()).toContain(`<link>${serverURL}/notes/${slugs.note}</link>`)
    expect(await en.text()).not.toContain(slugs.note)
  })

  test('generates the CV as a PDF, kept out of search engines', async ({ request }) => {
    const response = await request.get(`${serverURL}/cv.pdf`)
    const body = await response.body()

    expect(response.headers()['content-type']).toBe('application/pdf')
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow')
    expect(body.subarray(0, 5).toString()).toBe('%PDF-')
  })

  test('sends English browsers to /en from the home page only', async ({ request }) => {
    const headers = { 'Accept-Language': 'en-US,en;q=0.9' }
    const home = await request.get(`${serverURL}/`, { headers, maxRedirects: 0 })
    const deep = await request.get(`${serverURL}/projets/${slugs.study}`, {
      headers,
      maxRedirects: 0,
    })

    expect(home.status()).toBe(307)
    expect(home.headers().location).toBe('/en')
    expect(deep.status()).toBe(200)
  })

  test('switches language both ways from the home page', async ({ page }) => {
    await page.goto(`${serverURL}/`)
    await page.getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL(`${serverURL}/en`)

    await page.getByRole('link', { name: 'Français' }).click()
    await expect(page).toHaveURL(`${serverURL}/`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })

  test.describe('with an English browser', () => {
    test.use({ locale: 'en-US' })

    test('lands on /en, and can still pick French', async ({ page }) => {
      await page.goto(`${serverURL}/`)
      await expect(page).toHaveURL(`${serverURL}/en`)

      await page.getByRole('link', { name: 'Français' }).click()
      await expect(page).toHaveURL(`${serverURL}/`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    })
  })

  test('answers unknown pages with a localized 404', async ({ page }) => {
    expect((await page.goto(`${serverURL}/nulle-part`))?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Page introuvable')

    expect((await page.goto(`${serverURL}/en/nowhere`))?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Page not found')
  })

  test('previews drafts for the signed-in admin only', async ({ page, request }) => {
    const preview = `${serverURL}/next/preview?path=${encodeURIComponent(`/projets/${slugs.draft}`)}`

    expect((await request.get(preview, { maxRedirects: 0 })).status()).toBe(403)

    await page.request.post(`${serverURL}/api/users/login`, {
      data: { email: adminEmail, password: `${adminEmail}-password` },
    })
    await page.goto(preview)
    await expect(page).toHaveURL(`${serverURL}/projets/${slugs.draft}`)
    await expect(page.locator('h1')).toHaveText('Brouillon e2e')
    await expect(page.getByRole('status')).toContainText('Aperçu')

    await page.getByRole('link', { name: "Quitter l'aperçu" }).click()
    await expect(page).toHaveURL(`${serverURL}/projets/${slugs.draft}`)
    await expect(page.locator('h1')).toHaveText('Page introuvable')
  })

  test('refuses to redirect the preview off the site', async ({ page }) => {
    await page.request.post(`${serverURL}/api/users/login`, {
      data: { email: adminEmail, password: `${adminEmail}-password` },
    })
    // Payload only trusts the session cookie on same-origin requests, as a browser marks them.
    const response = await page.request.get(
      `${serverURL}/next/preview?path=${encodeURIComponent('//evil.example')}`,
      { maxRedirects: 0, headers: { 'Sec-Fetch-Site': 'same-origin' } },
    )

    expect(response.status()).toBe(307)
    expect(response.headers().location).toBe('/')
  })
})
