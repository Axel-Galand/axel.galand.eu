import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Picture } from '@/components/Picture'
import { RichText } from '@/components/RichText'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import { Toc } from '@/components/site/Toc'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublic, findPublicBySlug } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { tableOfContents } from '@/lib/headings'
import { ogImage } from '@/lib/images'
import { documentPath, localizedPath } from '@/lib/paths'
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

const card =
  'flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint'

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const note = await load(slug, locale)

  if (!note) {
    notFound()
  }

  const t = await getTranslations('notes')
  const tSite = await getTranslations('site')
  const [paths, { docs: all }] = await Promise.all([
    documentPaths('notes', slug),
    findPublic({ collection: 'notes', locale, sort: '-publishedAt', limit: 100, depth: 0 }),
  ])
  const toc = tableOfContents(note.body)
  // The next note is the one published before this one; after the oldest comes the newest. In
  // preview, a draft without a slug or title yet gets no card.
  const listed = all.filter((other) => other.slug && other.title)
  const position = listed.findIndex((other) => other.id === note.id)
  const next =
    position >= 0 && listed.length > 1 ? listed[(position + 1) % listed.length] : undefined

  return (
    <PageShell locale={locale} paths={paths} current="notes">
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

      <PageHero
        long
        crumbs={[{ label: t('slug'), href: localizedPath('/notes', locale) }, { label: note.slug }]}
        title={note.title}
        tags={
          note.tags?.length ? (
            <ul className="flex flex-wrap gap-2 font-mono text-[13px]">
              {note.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-rose/14 px-2.5 py-0.5 text-rose">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null
        }
      >
        <p className="font-mono text-sm text-muted">
          {note.publishedAt ? (
            <time dateTime={note.publishedAt}>
              {t('published', { date: formatDate(note.publishedAt, locale) })}
            </time>
          ) : null}
        </p>
      </PageHero>

      <div className="wrap grid grid-cols-1 items-start gap-x-4 gap-y-10 pt-6 pb-18 min-[980px]:grid-cols-12">
        {toc.length > 1 ? (
          <Toc
            label={t('toc')}
            entries={toc}
            className="min-[980px]:sticky min-[980px]:top-6 min-[980px]:col-span-3"
          />
        ) : null}
        <article
          className={`flex max-w-[45rem] flex-col gap-10 ${
            toc.length > 1 ? 'min-[980px]:col-span-9' : 'min-[980px]:col-span-12'
          }`}
        >
          <p className="text-[21px] leading-[1.5] text-ink">{note.excerpt}</p>
          {note.cover ? (
            <span className="block overflow-hidden rounded-2xl border border-line bg-inset">
              <Picture
                media={note.cover}
                sizes="(min-width: 48rem) 48rem, 100vw"
                eager
                className="w-full"
              />
            </span>
          ) : null}
          <RichText data={note.body} locale={locale} className="prose-site" />
        </article>
      </div>

      <nav
        aria-label={t('more')}
        className="wrap grid grid-cols-1 gap-4 pb-24 min-[980px]:grid-cols-12"
      >
        <Link href={localizedPath('/notes', locale)} className={`${card} min-[980px]:col-span-4`}>
          <span className="font-mono text-[13px] text-muted">
            <span aria-hidden="true">← </span>
            {t('back')}
          </span>
          <span className="font-display text-2xl font-semibold">{t('all')}</span>
        </Link>
        {next ? (
          <Link
            href={documentPath('notes', next.slug, locale)}
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
