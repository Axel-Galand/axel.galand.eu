import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { PageShell } from '@/components/site/PageShell'
import { Picture } from '@/components/Picture'
import type { Locale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
import { formatPeriod } from '@/lib/dates'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'

const paths = { fr: localizedPath('/projets', 'fr'), en: localizedPath('/projets', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('projects')

  return pageMetadata({ locale, paths, title: t('title'), description: t('description') })
}

export default async function ProjectsPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('projects')
  const { docs } = await findPublic({
    collection: 'case-studies',
    locale,
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  return (
    <PageShell locale={locale} paths={paths} current="projects" legacy>
      <h1>{t('title')}</h1>
      <p className="lead">{t('description')}</p>
      {docs.length ? (
        <ul className="cards">
          {docs.map((study) => (
            <li key={study.id}>
              <Picture media={study.cover} sizes="(min-width: 48rem) 48rem, 100vw" />
              <h2>
                <Link href={documentPath('case-studies', study.slug, locale)}>{study.title}</Link>
              </h2>
              <p className="muted">
                {study.sector} ·{' '}
                {formatPeriod(study.period?.start, study.period?.end, locale, t('present'))}
              </p>
              <p>{study.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('empty')}</p>
      )}
    </PageShell>
  )
}
