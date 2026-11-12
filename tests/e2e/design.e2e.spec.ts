import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { serverURL } from '../helpers/serverURL'

const theme = (page: Page) => page.locator('html').getAttribute('data-theme')

test.describe('themes', () => {
  // A French browser: in English, the home page rightly redirects to /en.
  test.use({ locale: 'fr-FR' })

  test('follow the system before the page is even hydrated', async ({ browser }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const context = await browser.newContext({ colorScheme, locale: 'fr-FR' })
      const page = await context.newPage()

      // No JavaScript bundle at all: only the inline script in <head> can set the theme.
      await page.route('**/_next/static/**/*.js', (route) => route.abort())
      await page.goto(`${serverURL}/`)
      expect(await theme(page)).toBe(colorScheme)
      await context.close()
    }
  })

  test('keep the visitor’s choice across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(`${serverURL}/`)

    const toggle = page.getByTestId('theme-toggle')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await page.reload()
    expect(await theme(page)).toBe('dark')

    // An explicit choice also wins over a system change.
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('switch at once, without animation, with reduced motion', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto(`${serverURL}/`)
    await page.getByTestId('theme-toggle').click()

    expect(await theme(page)).toBe('dark')
    const running = await page.evaluate(() =>
      document.getAnimations().filter((animation) => {
        const duration = Number(animation.effect?.getTiming().duration ?? 0)
        return duration > 1
      }),
    )
    expect(running).toHaveLength(0)
  })
})

test.describe('accessibility', () => {
  test.use({ locale: 'fr-FR' })

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/', '/projets', '/parcours', '/notes', '/page-qui-n-existe-pas']) {
      test(`${path} passes axe in the ${colorScheme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
        await page.goto(`${serverURL}${path}`)
        expect(await theme(page)).toBe(colorScheme)

        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()

        expect(
          violations.map(
            ({ id, nodes }) => `${id}: ${nodes.map((node) => node.target).join(' | ')}`,
          ),
        ).toEqual([])
      })
    }
  }
})
