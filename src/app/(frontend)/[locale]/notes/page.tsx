import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { Picture } from '@/components/Picture'
import { accentAt, accents } from '@/components/site/accents'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import { RssIcon } from '@/components/site/RssIcon'
import type { Locale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

const paths = { fr: localizedPath('/notes', 'fr'), en: localizedPath('/notes', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notes')

  const metadata = pageMetadata({ locale, paths, title: t('title'), description: t('description') })

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { 'application/rss+xml': absoluteURL(localizedPath('/notes/rss.xml', locale)) },
    },
  }
}

export default async function NotesPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notes')
  const { docs } = await findPublic({
    collection: 'notes',
    locale,
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  // The featured note opens the list; without one, the latest does.
  const lead = docs.find((note) => note.featured) ?? docs[0]
  const others = docs.filter((note) => note.id !== lead?.id)

  return (
    <PageShell locale={locale} paths={paths} current="notes">
      <PageHero crumbs={[{ label: t('slug') }]} title={t('title')} lead={<p>{t('lead')}</p>}>
        <a
          href={localizedPath('/notes/rss.xml', locale)}
          type="application/rss+xml"
          className="inline-flex min-h-11 items-center gap-2.5 self-start rounded-full border border-line-strong bg-surface px-4 font-mono text-sm no-underline"
        >
          <RssIcon />
          {t('rss')}
        </a>
      </PageHero>

      <div className="wrap flex flex-col gap-10 pt-2 pb-24">
        {lead ? (
          <Link
            href={documentPath('notes', lead.slug, locale)}
            className={`grid items-center gap-10 rounded-2xl border border-line bg-surface p-9 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint ${lead.cover ? 'min-[980px]:grid-cols-2' : ''}`}
          >
            <div className="flex flex-col gap-[18px]">
              <span className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
                {lead.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-rose/14 px-2.5 py-0.5 text-rose">
                    {tag}
                  </span>
                ))}
                <span className="text-muted">
                  {[
                    lead.featured ? t('featured') : t('latest'),
                    lead.publishedAt ? formatDate(lead.publishedAt, locale) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-tight">
                {lead.title}
              </h2>
              <p className="text-ink-2">{lead.excerpt}</p>
              <span className="font-mono text-sm">
                {t('read')} <span aria-hidden="true">→</span>
              </span>
            </div>
            {lead.cover ? (
              <span className="block overflow-hidden rounded-xl border border-line bg-inset">
                <Picture
                  media={lead.cover}
                  sizes="(min-width: 980px) 40vw, 100vw"
                  eager
                  className="aspect-[16/10] w-full object-cover"
                />
              </span>
            ) : null}
          </Link>
        ) : (
          <p className="text-ink-2">{t('empty')}</p>
        )}

        {others.length ? (
          <ul className="flex flex-col border-t border-line">
            {others.map((note, index) => (
              <li key={note.id} className="border-b border-line">
                <Link
                  href={documentPath('notes', note.slug, locale)}
                  className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 px-3 py-7 no-underline transition-colors hover:bg-surface min-[640px]:grid-cols-[140px_minmax(0,1fr)_24px]"
                >
                  <span className="font-mono text-[13px] text-muted">
                    {note.publishedAt ? (
                      <time dateTime={note.publishedAt}>
                        {formatDate(note.publishedAt, locale)}
                      </time>
                    ) : null}
                  </span>
                  <span className="flex flex-col gap-2.5">
                    {note.tags?.length ? (
                      <span className="flex flex-wrap gap-2 font-mono text-[13px]">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-2.5 py-0.5 ${accents[accentAt(index)].soft}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <h2 className="text-[26px] leading-[1.2] font-semibold">{note.title}</h2>
                    <span className="text-ink-2">{note.excerpt}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden font-mono text-muted min-[640px]:block"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageShell>
  )
}
