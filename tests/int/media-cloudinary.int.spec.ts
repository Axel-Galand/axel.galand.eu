// @vitest-environment node
// Payload sniffs file types on Uint8Array; under jsdom, Buffer comes from another realm and fails.
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { Writable } from 'stream'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { phonePhoto } from '../helpers/media'
import { testPayload } from '../helpers/payload'

// Runs before the imports: the config reads these when it loads. The plugin adds columns, so this
// file gets its own database. The credentials are fake and never sent: the SDK calls are stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = 'file:./test-cloudinary.db'
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
})

type UploadResult = { public_id: string; secure_url: string }
type UploadCallback = (error?: { message: string }, result?: UploadResult) => void
type CloudinarySDK = {
  uploader: {
    upload_stream: (options: Record<string, unknown>, callback: UploadCallback) => Writable
    destroy: (publicId: string, options: Record<string, unknown>) => Promise<{ result: string }>
  }
}

// The plugin's own copy of the SDK (pnpm keeps it out of our node_modules). Both resolve to the
// same module, so stubbing its methods stubs the calls the plugin makes.
const pluginDir = fs.realpathSync(
  path.resolve('node_modules/@jhb.software/payload-cloudinary-plugin'),
)
const { v2: cloudinary } = createRequire(path.join(pluginDir, 'package.json'))('cloudinary') as {
  v2: CloudinarySDK
}

let payload: Payload
const sent: { options: Record<string, unknown>; bytes: Buffer }[] = []
let uploadError: string | undefined

/** Plays Cloudinary: keeps what the plugin sends, then answers with `uploadError` or a new asset. */
const fakeUploadStream = (options: Record<string, unknown>, callback: UploadCallback) => {
  const chunks: Buffer[] = []

  return new Writable({
    write(chunk: Buffer, _encoding, done) {
      chunks.push(chunk)
      done()
    },
    final(done) {
      sent.push({ options, bytes: Buffer.concat(chunks) })
      const id = `portfolio/asset${sent.length}`

      if (uploadError) {
        callback({ message: uploadError })
      } else {
        callback(undefined, {
          public_id: id,
          secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v1/${id}.jpg`,
        })
      }
      done()
    },
  })
}

const upload = async (alt: string) => {
  const data = await phonePhoto()

  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: 'IMG_1234.jpg', size: data.length },
  })
}

const rowCounts = async () => {
  const locales = await payload.db.drizzle.$client.execute(
    'select count(*) as n from media_locales',
  )

  return {
    media: (await payload.count({ collection: 'media' })).totalDocs,
    locales: Number(locales.rows[0]?.n),
  }
}

describe('media uploads to Cloudinary', () => {
  beforeAll(async () => {
    payload = await testPayload()
    vi.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(fakeUploadStream)
    vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' })
  })

  beforeEach(() => {
    uploadError = undefined
    vi.mocked(cloudinary.uploader.destroy).mockClear()
  })

  afterAll(async () => {
    await payload.delete({ collection: 'media', where: { id: { exists: true } } })
    vi.restoreAllMocks()
  })

  it('sends the re-encoded photo: no EXIF, at most 3200px, random id in the folder', async () => {
    const doc = await upload('cloud ok')
    const { options, bytes } = sent.at(-1)!
    const meta = await sharp(bytes).metadata()

    expect(meta.exif).toBeUndefined()
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBe(3200)
    // The plugin normalizes the folder with a trailing slash.
    expect(options.folder).toBe('portfolio/')
    expect(options.public_id).toBeUndefined()

    const stored = await payload.findByID({ collection: 'media', id: doc.id })

    expect(stored.cloudinaryPublicId).toBe(`portfolio/asset${sent.length}`)
    expect(stored.url).toMatch(/^https:\/\/res\.cloudinary\.com\/test-cloud\//)
    expect(stored.blurDataUrl).toMatch(/^data:image\/webp;base64,/)
  })

  it('leaves no media row behind when the upload fails', async () => {
    uploadError = 'Server returned unexpected status code - 403'
    const before = await rowCounts()

    await expect(upload('cloud refused')).rejects.toThrow('403')
    expect(await rowCounts()).toEqual(before)
    // Nothing reached Cloudinary, so there is nothing to delete there.
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
  })

  it('puts the row back when replacing the file fails', async () => {
    const doc = await upload('cloud replace')
    const other = await sharp({
      create: { width: 800, height: 600, channels: 3, background: '#a47' },
    })
      .jpeg()
      .toBuffer()
    uploadError = 'Server returned unexpected status code - 403'

    await expect(
      payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: { data: other, mimetype: 'image/jpeg', name: 'other.jpg', size: other.length },
      }),
    ).rejects.toThrow('403')

    const stored = await payload.findByID({ collection: 'media', id: doc.id })

    expect(stored).toMatchObject({
      filename: doc.filename,
      filesize: doc.filesize,
      width: doc.width,
      height: doc.height,
      blurDataUrl: doc.blurDataUrl,
      cloudinaryPublicId: doc.cloudinaryPublicId,
    })
  })

  it('deletes the asset at Cloudinary with the document', async () => {
    const doc = await upload('cloud delete')

    await payload.delete({ collection: 'media', id: doc.id })

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(doc.cloudinaryPublicId, {
      resource_type: 'image',
    })
  })
})
