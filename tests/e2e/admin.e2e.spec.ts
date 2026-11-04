import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'
import { serverURL } from '../helpers/serverURL'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto(`${serverURL}/admin`)
    await expect(page).toHaveURL(`${serverURL}/admin`)
    const dashboardArtifact = page.locator('span[title="Tableau de bord"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto(`${serverURL}/admin/collections/users`)
    await expect(page).toHaveURL(`${serverURL}/admin/collections/users`)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to own account', async () => {
    await page.goto(`${serverURL}/admin/account`)
    await expect(page).toHaveURL(`${serverURL}/admin/account`)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })

  // Every collection and global of the content model opens in the (French) admin.
  for (const [path, heading] of [
    ['collections/case-studies', 'Études de cas'],
    ['collections/notes', 'Notes techniques'],
    ['collections/albums', 'Albums'],
    ['collections/experiences', 'Expériences et formations'],
    ['collections/skills', 'Compétences'],
    ['collections/media', 'Médias'],
    ['globals/profile', 'Profil'],
    ['globals/site-settings', 'Réglages du site'],
  ] as const) {
    test(`opens ${path}`, async () => {
      await page.goto(`${serverURL}/admin/${path}`)
      await expect(page.locator('h1', { hasText: heading }).first()).toBeVisible()
    })
  }
})
