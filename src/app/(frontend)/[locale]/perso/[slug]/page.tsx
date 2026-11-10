import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { PageShell } from '@/components/site/PageShell'
import { Picture } from '@/components/Picture'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublicBySlug } from '@/lib/content'
import { imageSources } from '@/lib/images'
import { localizedPath } from '@/lib/paths'
import { breadcrumbs } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => []

const load = cache((slug: string, locale: Locale) =>
  findPublicBySlug('albums', slug, locale, { depth: 1 }),
)

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
      description: album.description ?? undefined,
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
  const paths = await documentPaths('albums', slug)
  const photos = (album.photos ?? []).flatMap((photo) => (typeof photo === 'object' ? [photo] : []))

  return (
    <PageShell locale={locale} paths={paths} current="personal" legacy>
      <article>
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
        <h1>{album.title}</h1>
        <p className="muted">
          {t('season', { season: album.season })} · {t('photos', { count: photos.length })}
        </p>
        {album.description ? <p>{album.description}</p> : null}
        <ul className="grid">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <figure>
                <Picture media={photo} sizes="(min-width: 48rem) 15rem, 50vw" eager={index < 4} />
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      </article>
    </PageShell>
  )
}
