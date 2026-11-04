import { createNavigation } from 'next-intl/navigation'
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { grammarFor } from '@/components/CodeBlock'
import { serializeJsonLd } from '@/components/JsonLd'
import { locales } from '@/i18n/locales'
import { pathnames, type Route } from '@/i18n/pathnames'
import { routing } from '@/i18n/routing'
import { imageSources } from '@/lib/images'
import { documentPath, localizedPath } from '@/lib/paths'
import { alternates } from '@/lib/seo/metadata'
import type { Media } from '@/payload-types'
import { isPublicPath, proxy } from '@/proxy'

const media = (overrides: Partial<Media>): Media =>
  ({
    id: 1,
    alt: 'Alt',
    mimeType: 'image/jpeg',
    width: 3200,
    height: 1800,
    url: '/api/media/file/photo.jpg',
    cloudinaryPublicId: 'portfolio/abc',
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }) as Media

describe('localized paths', () => {
  it('builds the same URLs as next-intl, for every route and locale', () => {
    const { getPathname } = createNavigation(routing)

    for (const route of Object.keys(pathnames) as Route[]) {
      for (const locale of locales) {
        const params = route.includes('[slug]') ? { slug: 'un-projet' } : {}
        const href = route.includes('[slug]') ? { pathname: route, params } : route

        // @ts-expect-error -- the union of routes is too wide for next-intl's per-route typing.
        expect(localizedPath(route, locale, params)).toBe(getPathname({ locale, href }))
      }
    }
  })

  it('keeps one slug in both languages', () => {
    expect(documentPath('case-studies', 'x', 'fr')).toBe('/projets/x')
    expect(documentPath('case-studies', 'x', 'en')).toBe('/en/projects/x')
    expect(documentPath('albums', 'x', 'en')).toBe('/en/personal/x')
  })
})

describe('proxy scope', () => {
  it('leaves the admin, the API, the healthcheck and Next files to their own routes', () => {
    for (const path of [
      '/admin',
      '/admin/collections/notes',
      '/api/notes',
      '/api/mcp',
      '/healthz',
      '/next/preview',
      '/_next/image',
      '/robots.txt',
      '/sitemap.xml',
    ]) {
      expect(isPublicPath(path), path).toBe(false)
    }
    for (const path of [
      '/',
      '/en',
      '/projets/x',
      '/cv.pdf',
      '/notes/rss.xml',
      '/administratif',
      '/api-docs',
    ]) {
      expect(isPublicPath(path), path).toBe(true)
    }
  })
})

describe('proxy routing', () => {
  const run = (path: string, headers: Record<string, string> = {}) => {
    const response = proxy(new NextRequest(`http://localhost${path}`, { headers }))

    return {
      status: response.status,
      location: response.headers.get('location'),
      rewrite: response.headers.get('x-middleware-rewrite'),
    }
  }

  it('rewrites public paths to the locale routes', () => {
    expect(run('/projets/x').rewrite).toBe('http://localhost/fr/projets/x')
    expect(run('/en/projects/x').rewrite).toBe('http://localhost/en/projets/x')
  })

  // Production runs the proxy again on `/fr/...`: redirecting it to `/...` would loop forever.
  it('lets the second pass on a rewritten path through', () => {
    expect(run('/fr/projets/x', { 'x-next-intl-locale': 'fr' })).toEqual({
      status: 200,
      location: null,
      rewrite: null,
    })
  })

  it('detects the language on the home page only', () => {
    const english = { 'accept-language': 'en-US,en;q=0.9' }

    expect(run('/', english)).toMatchObject({ status: 307, location: 'http://localhost/en' })
    expect(run('/projets/x', english).rewrite).toBe('http://localhost/fr/projets/x')
  })

  // The "Français" link on an English page is a same-origin link to `/`.
  it('lets the language switch reach the French home page', () => {
    const switching = {
      'accept-language': 'en-US,en;q=0.9',
      cookie: 'NEXT_LOCALE=en',
      'sec-fetch-site': 'same-origin',
    }

    expect(run('/', switching).rewrite).toBe('http://localhost/fr')
  })
})

describe('alternates', () => {
  it('lists only existing translations, with x-default on the French page', () => {
    expect(alternates('en', { fr: '/notes/x', en: '/en/notes/x' })).toEqual({
      canonical: '/en/notes/x',
      languages: { fr: '/notes/x', en: '/en/notes/x', 'x-default': '/notes/x' },
    })
    expect(alternates('fr', { fr: '/notes/x' })).toEqual({
      canonical: '/notes/x',
      languages: { fr: '/notes/x', 'x-default': '/notes/x' },
    })
  })
})

describe('JSON-LD', () => {
  it('cannot close its script tag', () => {
    const html = serializeJsonLd({ name: '</script><script>alert(1)</script>' })

    expect(html).not.toContain('</script>')
    expect(JSON.parse(html).name).toBe('</script><script>alert(1)</script>')
  })
})

describe('image sources', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the named transformations and stops at the original width', () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'cloud')
    const base = 'https://res.cloudinary.com/cloud/image/upload'

    expect(imageSources(media({ width: 1000 }))).toEqual({
      src: `${base}/t_pf_w960/portfolio/abc`,
      srcSet: `${base}/t_pf_w480/portfolio/abc 480w, ${base}/t_pf_w960/portfolio/abc 960w, ${base}/t_pf_w1440/portfolio/abc 1000w`,
    })
  })

  it('serves SVG and local files as they are', () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'cloud')
    expect(imageSources(media({ mimeType: 'image/svg+xml', url: 'https://x/y.svg' }))).toEqual({
      src: 'https://x/y.svg',
    })

    vi.stubEnv('CLOUDINARY_CLOUD_NAME', '')
    expect(imageSources(media({}))).toEqual({ src: '/api/media/file/photo.jpg' })
  })
})

describe('code highlighting', () => {
  it('maps the editor languages to grammars, and the rest to plain text', () => {
    expect(grammarFor('ts')).toBe('typescript')
    expect(grammarFor('dockerfile')).toBe('docker')
    expect(grammarFor('yaml')).toBe('yaml')
    expect(grammarFor('plaintext')).toBe('text')
    expect(grammarFor('cobol')).toBe('text')
    expect(grammarFor(null)).toBe('text')
  })
})

describe('preview links', () => {
  it('point the admin to the page of the document, in its language', async () => {
    const { previewDocument, previewRoute } = await import('@/lib/preview')

    expect(previewDocument('notes')({ slug: 'x' }, { locale: 'en' })).toBe(
      '/next/preview?path=%2Fen%2Fnotes%2Fx',
    )
    expect(previewDocument('notes')({}, { locale: 'fr' })).toBeNull()
    expect(previewRoute('/parcours')({}, { locale: 'en' })).toBe(
      '/next/preview?path=%2Fen%2Fbackground',
    )
  })
})
