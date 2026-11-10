import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { PageShell } from '@/components/site/PageShell'
import { Picture } from '@/components/Picture'
import { RichText } from '@/components/RichText'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublicBySlug } from '@/lib/content'
import { formatPeriod } from '@/lib/dates'
import { ogImage } from '@/lib/images'
import { localizedPath } from '@/lib/paths'
import { breadcrumbs } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

// Rendered on first visit, cached until content changes.
export const generateStaticParams = () => []

const load = cache((slug: string, locale: Locale) =>
  findPublicBySlug('case-studies', slug, locale, { depth: 1 }),
)

const sections = ['context', 'challenge', 'work', 'result', 'learnings'] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const study = await load(slug, locale)

  if (!study) {
    return {}
  }

  return pageMetadata({
    locale,
    paths: await documentPaths('case-studies', slug),
    type: 'article',
    ...seoFields(study, { title: study.title, description: study.summary, image: study.cover }),
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as Locale
  const study = await load(slug, locale)

  if (!study) {
    notFound()
  }

  const t = await getTranslations('projects')
  const tSite = await getTranslations('site')
  const paths = await documentPaths('case-studies', slug)
  const stack = (study.stack ?? []).flatMap((skill) => (typeof skill === 'object' ? [skill] : []))
  // Labels are localized: a row without one in this language is left out.
  const metrics = (study.metrics ?? []).filter((metric) => metric.label)

  return (
    <PageShell locale={locale} paths={paths} current="projects" legacy>
      <article>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: study.title,
            abstract: study.summary,
            inLanguage: locale,
            url: absoluteURL(paths[locale] ?? ''),
            dateModified: study.updatedAt,
            author: { '@id': absoluteURL('/#person') },
            keywords: stack.map(({ name }) => name),
            image: ogImage(study.cover)?.url,
          }}
        />
        <JsonLd
          data={breadcrumbs([
            { name: tSite('home'), path: localizedPath('/', locale) },
            { name: t('title'), path: localizedPath('/projets', locale) },
            { name: study.title, path: paths[locale] ?? '' },
          ])}
        />
        <h1>{study.title}</h1>
        <p className="lead">{study.summary}</p>
        <dl>
          <dt>{t('sector')}</dt>
          <dd>{study.sector}</dd>
          {study.role ? (
            <>
              <dt>{t('role')}</dt>
              <dd>{study.role}</dd>
            </>
          ) : null}
          <dt>{t('period')}</dt>
          <dd>{formatPeriod(study.period?.start, study.period?.end, locale, t('present'))}</dd>
          {stack.length ? (
            <>
              <dt>{t('stack')}</dt>
              <dd>{stack.map(({ name }) => name).join(', ')}</dd>
            </>
          ) : null}
        </dl>
        <Picture media={study.cover} sizes="(min-width: 48rem) 48rem, 100vw" eager />
        {metrics.length ? (
          <section>
            <h2>{t('metrics')}</h2>
            <ul>
              {metrics.map((metric) => (
                <li key={metric.id ?? metric.label}>
                  <strong>{metric.value}</strong> {metric.label}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {sections.map((section) =>
          study[section] ? (
            <section key={section}>
              <h2>{t(section)}</h2>
              <RichText data={study[section]} locale={locale} />
            </section>
          ) : null,
        )}
        {study.diagram ? (
          <figure>
            <Picture media={study.diagram} sizes="(min-width: 48rem) 48rem, 100vw" />
            <figcaption>{t('diagram')}</figcaption>
          </figure>
        ) : null}
      </article>
    </PageShell>
  )
}
