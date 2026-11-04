// @vitest-environment node
// Payload sniffs file types on Uint8Array; under jsdom, Buffer comes from another realm and fails.
import fs from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { phonePhoto } from '../helpers/media'
import { testPayload } from '../helpers/payload'

let payload: Payload
const mediaDir = path.resolve(process.env.MEDIA_DIR ?? './test-media')
const created: number[] = []

const upload = async (data: Buffer, name: string, mimetype: string) => {
  const doc = await payload.create({
    collection: 'media',
    data: { alt: name },
    file: { data, mimetype, name, size: data.length },
  })
  created.push(doc.id)

  return doc
}

describe('media uploads', () => {
  beforeAll(async () => {
    payload = await testPayload()
  })

  afterAll(async () => {
    for (const id of created) {
      await payload.delete({ collection: 'media', id })
    }
    await fs.rm(mediaDir, { recursive: true, force: true })
  })

  it('checks the fixture really has GPS data', async () => {
    const meta = await sharp(await phonePhoto()).metadata()

    expect(meta.exif?.length).toBeGreaterThan(0)
  })

  it('stores the original without EXIF and within 3200px', async () => {
    const doc = await upload(await phonePhoto(), 'phone.jpg', 'image/jpeg')
    const stored = await sharp(await fs.readFile(path.join(mediaDir, doc.filename!))).metadata()

    expect(stored.exif).toBeUndefined()
    expect(Math.max(stored.width ?? 0, stored.height ?? 0)).toBeLessThanOrEqual(3200)
    expect(doc.width).toBe(3200)
  })

  it('adds a tiny blur placeholder', async () => {
    const doc = await upload(await phonePhoto(), 'blur.jpg', 'image/jpeg')

    expect(doc.blurDataUrl).toMatch(/^data:image\/webp;base64,/)
    expect(doc.blurDataUrl!.length).toBeLessThan(1000)
  })

  it('accepts a plain SVG diagram', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    )
    const doc = await upload(svg, 'diagram.svg', 'image/svg+xml')

    expect(doc.mimeType).toBe('image/svg+xml')
    expect(doc.blurDataUrl ?? null).toBeNull()
  })

  it('rejects an SVG carrying a script', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>',
    )

    await expect(upload(svg, 'evil.svg', 'image/svg+xml')).rejects.toThrow()
  })

  it('rejects a file type outside the list', async () => {
    await expect(upload(Buffer.from('%PDF-1.4'), 'doc.pdf', 'application/pdf')).rejects.toThrow()
  })
})
