import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { RichText } from '@/components/RichText'
import type { Locale } from '@/i18n/locales'
import { findPublic, findPublicGlobal } from '@/lib/content'
import { formatDate } from '@/lib/dates'
import { documentPath, localizedPath } from '@/lib/paths'
import { person } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

// The home page exists in both languages; untranslated content is simply left out of /en.
const paths = { fr: localizedPath('/', 'fr'), en: localizedPath('/', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const [profile, settings] = await Promise.all([
    findPublicGlobal({ slug: 'profile', locale, depth: 1 }),
    findPublicGlobal({ slug: 'site-settings', locale, depth: 1 }),
  ])

  return pageMetadata({
    locale,
    paths,
    type: 'profile',
    ...seoFields(profile, {
      title: settings.defaultTitle,
      description: settings.defaultDescription || profile.headline,
      image: settings.defaultOgImage,
    }),
  })
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('home')
  const [profile, { docs: featured }, { docs: notes }] = await Promise.all([
    findPublicGlobal({ slug: 'profile', locale, depth: 1 }),
    findPublic({
      collection: 'case-studies',
      locale,
      where: { featured: { equals: true } },
      sort: 'order',
      limit: 6,
      depth: 0,
    }),
    findPublic({ collection: 'notes', locale, sort: '-publishedAt', limit: 3, depth: 0 }),
  ])

  return (
    <>
      <LanguageSwitch locale={locale} paths={paths} />
      {profile.name ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            url: absoluteURL(paths[locale]),
            mainEntity: person(profile, locale),
          }}
        />
      ) : null}
      <h1>{profile.name || 'Axel Galand'}</h1>
      {profile.headline ? <p className="lead">{profile.headline}</p> : null}
      <RichText data={profile.bio} locale={locale} />

      {featured.length ? (
        <section>
          <h2>{t('featured')}</h2>
          <ul className="cards">
            {featured.map((study) => (
              <li key={study.id}>
                <h3>
                  <Link href={documentPath('case-studies', study.slug, locale)}>{study.title}</Link>
                </h3>
                <p>{study.summary}</p>
              </li>
            ))}
          </ul>
          <p>
            <Link href={localizedPath('/projets', locale)}>{t('allProjects')}</Link>
          </p>
        </section>
      ) : null}

      {notes.length ? (
        <section>
          <h2>{t('latestNotes')}</h2>
          <ul className="cards">
            {notes.map((note) => (
              <li key={note.id}>
                <h3>
                  <Link href={documentPath('notes', note.slug, locale)}>{note.title}</Link>
                </h3>
                {note.publishedAt ? (
                  <p className="muted">
                    <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
                  </p>
                ) : null}
                <p>{note.excerpt}</p>
              </li>
            ))}
          </ul>
          <p>
            <Link href={localizedPath('/notes', locale)}>{t('allNotes')}</Link>
          </p>
        </section>
      ) : null}

      {profile.links?.length || profile.email ? (
        <section>
          <h2>{t('links')}</h2>
          <ul>
            {profile.email ? (
              <li>
                <a href={`mailto:${profile.email}`}>{t('email')}</a>
              </li>
            ) : null}
            {profile.links?.map((link) => (
              <li key={link.id ?? link.url}>
                <a href={link.url} rel="me">
                  {link.label ||
                    (link.kind === 'linkedin'
                      ? 'LinkedIn'
                      : link.kind === 'github'
                        ? 'GitHub'
                        : link.url)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
