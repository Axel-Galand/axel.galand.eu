import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'
import { serverURL } from '../helpers/serverURL'

const marker = `e2e-album-${Date.now()}`
const albumPath = `/perso/${marker}`
let payload: Payload
const mediaIds: number[] = []

const photo = async (name: string, width: number, height: number, background: string) => {
  const data = await sharp({ create: { width, height, channels: 3, background } })
    .jpeg()
    .toBuffer()
  const doc = await payload.create({
    collection: 'media',
    data: { alt: `Photo ${name}` },
    file: { data, mimetype: 'image/jpeg', name: `${marker}-${name}.jpg`, size: data.length },
  })

  mediaIds.push(doc.id)
  return doc.id
}

const axe = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map(({ id, nodes }) => `${id}: ${nodes.length}`)

test.describe('personal pages', () => {
  // A French browser: in English, the home page rightly redirects to /en.
  test.use({ locale: 'fr-FR' })

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    const photos = [
      await photo('un', 1200, 800, '#c50'),
      await photo('deux', 800, 1200, '#36c'),
      await photo('trois', 1200, 800, '#5a3'),
    ]

    await payload.create({
      collection: 'albums',
      locale: 'fr',
      data: {
        title: 'Album e2e',
        slug: marker,
        season: 2026,
        category: 'enduro',
        cover: photos[0],
        photos,
        _status: 'published',
      },
    })
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'albums', where: { slug: { equals: marker } } })
    await payload.delete({ collection: 'media', where: { id: { in: mediaIds } } })
  })

  test('lists the album with its universe, and passes axe in both themes', async ({ page }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })

      await page.goto(`${serverURL}/perso`)
      await expect(
        page.locator('#enduro').getByRole('link', { name: /Album e2e/ }),
      ).toHaveAttribute('href', albumPath)
      expect(await axe(page)).toEqual([])

      for (const path of [albumPath, '/mentions-legales']) {
        await page.goto(`${serverURL}${path}`)
        expect(await axe(page), `${colorScheme} ${path}`).toEqual([])
      }
    }
  })

  test('opens each photo in a viewer driven by the keyboard, with a URL per photo', async ({
    page,
  }) => {
    await page.goto(`${serverURL}${albumPath}`)
    const dialog = page.getByRole('dialog')

    await page.getByRole('link', { name: /Photo un/ }).click()
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL(/#photo-1$/)
    await expect(dialog.getByText('1 / 3')).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#photo-2$/)
    await expect(dialog.getByRole('img', { name: 'Photo deux' })).toBeVisible()

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog.getByText('3 / 3')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    // The close event comes just after the dialog hides.
    await expect.poll(() => new URL(page.url()).hash).toBe('')
    // Focus goes back to the tile of the photo last shown.
    await expect(page.getByRole('link', { name: /Photo trois/ })).toBeFocused()

    // A shared link opens its photo.
    await page.goto(`${serverURL}${albumPath}#photo-2`)
    await expect(dialog.getByText('2 / 3')).toBeVisible()
  })
})
