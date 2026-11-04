import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Picture } from '@/components/Picture'
import { RichText } from '@/components/RichText'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublicBySlug } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { ogImage } from '@/lib/images'
import { localizedPath } from '@/lib/paths'
import { breadcrumbs } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => []

const load = cache((slug: string, locale: Locale) =>
  findPublicBySlug('notes', slug, locale, { depth: 1 }),
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const note = await load(slug, locale)

  if (!note) {
    return {}
  }

  return pageMetadata({
    locale,
    paths: await documentPaths('notes', slug),
    type: 'article',
    ...seoFields(note, { title: note.title, description: note.excerpt, image: note.cover }),
  })
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const note = await load(slug, locale)

  if (!note) {
    notFound()
  }

  const t = await getTranslations('notes')
  const tSite = await getTranslations('site')
  const paths = await documentPaths('notes', slug)

  return (
    <article>
      <LanguageSwitch locale={locale} paths={paths} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: note.title,
          description: note.excerpt,
          inLanguage: locale,
          url: absoluteURL(paths[locale] ?? ''),
          datePublished: note.publishedAt ?? note.createdAt,
          dateModified: note.updatedAt,
          author: { '@id': absoluteURL('/#person') },
          keywords: note.tags ?? undefined,
          image: ogImage(note.cover)?.url,
        }}
      />
      <JsonLd
        data={breadcrumbs([
          { name: tSite('home'), path: localizedPath('/', locale) },
          { name: t('title'), path: localizedPath('/notes', locale) },
          { name: note.title, path: paths[locale] ?? '' },
        ])}
      />
      <h1>{note.title}</h1>
      {note.publishedAt ? (
        <p className="muted">
          <time dateTime={note.publishedAt}>
            {t('published', { date: formatDate(note.publishedAt, locale) })}
          </time>
        </p>
      ) : null}
      <Picture media={note.cover} sizes="(min-width: 48rem) 48rem, 100vw" eager />
      <RichText data={note.body} locale={locale} />
      {note.tags?.length ? <p className="muted">{note.tags.join(' · ')}</p> : null}
    </article>
  )
}
