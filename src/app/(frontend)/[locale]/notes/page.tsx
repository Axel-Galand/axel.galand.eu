import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { LanguageSwitch } from '@/components/LanguageSwitch'
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
    depth: 0,
  })

  return (
    <>
      <LanguageSwitch locale={locale} paths={paths} />
      <h1>{t('title')}</h1>
      {docs.length ? (
        <ul className="cards">
          {docs.map((note) => (
            <li key={note.id}>
              <h2>
                <Link href={documentPath('notes', note.slug, locale)}>{note.title}</Link>
              </h2>
              {note.publishedAt ? (
                <p className="muted">
                  <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
                </p>
              ) : null}
              <p>{note.excerpt}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('empty')}</p>
      )}
    </>
  )
}
