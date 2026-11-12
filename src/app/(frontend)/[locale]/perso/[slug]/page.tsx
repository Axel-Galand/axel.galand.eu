import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Gallery, type GalleryPhoto } from '@/components/personal/Gallery'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublic, findPublicBySlug } from '@/lib/content'
import { imageSources } from '@/lib/images'
import { documentPath, localizedPath } from '@/lib/paths'
import { breadcrumbs } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => []

const load = cache((slug: string, locale: Locale) =>
  findPublicBySlug('albums', slug, locale, { depth: 1 }),
)

const card =
  'flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const album = await load(slug, locale)

  if (!album) {
    return {}
  }

  return pageMetadata({
    locale,
    paths: await documentPaths('albums', slug),
    ...seoFields(album, {
      title: album.title,
      // Without its own description, the album gets the section's.
      description: album.description || (await getTranslations('personal'))('description'),
      image: album.cover,
    }),
  })
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const album = await load(slug, locale)

  if (!album) {
    notFound()
  }

  const t = await getTranslations('personal')
  const tSite = await getTranslations('site')
  const [paths, { docs: all }] = await Promise.all([
    documentPaths('albums', slug),
    findPublic({ collection: 'albums', locale, sort: ['-season', 'order'], limit: 100, depth: 0 }),
  ])
  const photos = (album.photos ?? []).flatMap((photo) => (typeof photo === 'object' ? [photo] : []))
  const road = album.category === 'road'
  // After the last album comes the first; in preview, a draft without a slug or title gets no card.
  const listed = all.filter((other) => other.slug && other.title)
  const position = listed.findIndex((other) => other.id === album.id)
  const next =
    position >= 0 && listed.length > 1 ? listed[(position + 1) % listed.length] : undefined

  const gallery: GalleryPhoto[] = photos.map((photo) => ({
    id: photo.id,
    ...imageSources(photo),
    width: photo.width ?? undefined,
    height: photo.height ?? undefined,
    alt: photo.alt,
    caption: photo.caption ?? undefined,
    blur: photo.blurDataUrl ?? undefined,
  }))

  return (
    <PageShell locale={locale} paths={paths} current="personal">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: album.title,
          description: album.description ?? undefined,
          inLanguage: locale,
          url: absoluteURL(paths[locale] ?? ''),
          author: { '@id': absoluteURL('/#person') },
          image: photos.map((photo) => ({
            '@type': 'ImageObject',
            contentUrl: absoluteURL(imageSources(photo).src),
            caption: photo.caption ?? photo.alt,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbs([
          { name: tSite('home'), path: localizedPath('/', locale) },
          { name: t('title'), path: localizedPath('/perso', locale) },
          { name: album.title, path: paths[locale] ?? '' },
        ])}
      />

      <PageHero
        long
        crumbs={[
          { label: t('slug'), href: localizedPath('/perso', locale) },
          { label: album.slug },
        ]}
        title={album.title}
        tags={
          <p
            className={`self-start rounded-full px-2.5 py-0.5 font-mono text-[13px] ${
              road ? 'bg-route/14 text-route' : 'bg-enduro/14 text-enduro'
            }`}
          >
            {t(road ? 'road' : 'enduro')}
          </p>
        }
        lead={album.description ? <p>{album.description}</p> : undefined}
      >
        <p className="font-mono text-sm text-muted">
          {[
            album.place,
            t('season', { season: album.season }),
            t('photos', { count: photos.length }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </PageHero>

      <div className="wrap pt-2 pb-18">
        {gallery.length ? (
          <Gallery
            photos={gallery}
            title={album.title}
            labels={{
              open: t('open'),
              close: t('close'),
              previous: t('previous'),
              next: t('nextPhoto'),
              counter: t('counter', { index: '{index}', total: '{total}' }),
              position: t('position', { index: '{index}', total: '{total}', alt: '{alt}' }),
            }}
          />
        ) : (
          <p className="text-ink-2">{t('noPhotos')}</p>
        )}
      </div>

      <nav
        aria-label={t('more')}
        className="wrap grid grid-cols-1 gap-4 pb-24 min-[980px]:grid-cols-12"
      >
        <Link href={localizedPath('/perso', locale)} className={`${card} min-[980px]:col-span-4`}>
          <span className="font-mono text-[13px] text-muted">
            <span aria-hidden="true">← </span>
            {t('back')}
          </span>
          <span className="font-display text-2xl font-semibold">{t('all')}</span>
        </Link>
        {next ? (
          <Link
            href={documentPath('albums', next.slug, locale)}
            className={`${card} min-[980px]:col-span-8`}
          >
            <span className="flex justify-between font-mono text-[13px] text-muted">
              {t('next')}
              <span aria-hidden="true">→</span>
            </span>
            <span className="font-display text-2xl font-semibold">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </PageShell>
  )
}
