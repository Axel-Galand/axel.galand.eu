import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Picture } from '@/components/Picture'
import { ProjectVisual, stackNames } from '@/components/projects/ProjectCard'
import { projectCardLabels } from '@/components/projects/labels'
import { RichText } from '@/components/RichText'
import { accentAt, accents } from '@/components/site/accents'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import { Toc } from '@/components/site/Toc'
import type { Locale } from '@/i18n/locales'
import { documentPaths } from '@/lib/alternates'
import { findPublic, findPublicBySlug } from '@/lib/content'
import { hasContent } from '@/lib/headings'
import { formatPeriod } from '@/lib/dates'
import { ogImage } from '@/lib/images'
import { documentPath, localizedPath } from '@/lib/paths'
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
  const [paths, labels, { docs: all }] = await Promise.all([
    documentPaths('case-studies', slug),
    projectCardLabels(),
    findPublic({ collection: 'case-studies', locale, sort: 'order', limit: 100, depth: 0 }),
  ])
  const stack = stackNames(study)
  // Labels are localized: a row without one in this language is left out.
  const metrics = (study.metrics ?? []).filter((metric) => metric.label)
  const present = sections.filter((section) => hasContent(study[section]))
  // In preview a draft may have no slug or title yet: it gets no card.
  const listed = all.filter((other) => other.slug && other.title)
  const position = listed.findIndex((other) => other.id === study.id)
  // The list loops: after the last project comes the first.
  const next =
    position >= 0 && listed.length > 1 ? listed[(position + 1) % listed.length] : undefined
  const accent = accentAt(Math.max(position, 0))
  const visual = study.visual ?? 'cover'
  const drawn = visual !== 'cover' && visual !== 'none'
  const cover = visual === 'cover' ? study.cover : null

  const meta = [
    { label: t('sector'), value: study.sector },
    { label: t('role'), value: study.role },
    { label: t('frame'), value: study.kind === 'personal' ? t('personalFrame') : t('clientFrame') },
    {
      label: t('period'),
      value: formatPeriod(study.period?.start, study.period?.end, locale, t('present')),
    },
    { label: t('team'), value: study.team },
  ].filter((item) => item.value)

  return (
    <PageShell locale={locale} paths={paths} current="projects">
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
          keywords: stack,
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

      <PageHero
        long
        crumbs={[
          { label: t('slug'), href: localizedPath('/projets', locale) },
          { label: study.slug },
        ]}
        title={study.title}
        lead={<p>{study.summary}</p>}
        tags={
          stack.length || study.status === 'testing' ? (
            <ul className="flex flex-wrap gap-2 font-mono text-[13px]">
              {stack.map((name) => (
                <li key={name} className={`rounded-full px-2.5 py-0.5 ${accents[accent].soft}`}>
                  {name}
                </li>
              ))}
              {study.status === 'testing' ? (
                <li className="rounded-full border border-dashed border-enduro px-2.5 py-0.5 text-enduro">
                  {t('testing')}
                </li>
              ) : null}
            </ul>
          ) : null
        }
      >
        <dl className="mt-3 grid grid-cols-1 gap-4 border-t border-line pt-5 min-[640px]:grid-cols-2 min-[980px]:grid-cols-4">
          {meta.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="font-mono text-[13px] text-muted">{item.label}</dt>
              <dd className="font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {metrics.length || drawn || cover ? (
        <div className="wrap grid grid-cols-1 gap-4 pt-2 min-[640px]:grid-cols-2 min-[980px]:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.id ?? metric.label}
              className={`flex min-h-44 flex-col justify-between gap-7 rounded-2xl p-6 ${
                index === 0 ? 'bg-code-fill text-on-fill' : 'border border-line bg-surface'
              }`}
            >
              <span className={`font-mono text-[13px] ${index === 0 ? '' : 'text-muted'}`}>
                {metric.label}
              </span>
              <span
                className={`font-display text-[clamp(3rem,5vw,4.5rem)] leading-[0.9] font-bold tracking-tight ${
                  index === 0 ? '' : accents[accentAt(index)].text
                }`}
              >
                {metric.value}
              </span>
            </div>
          ))}
          {cover ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-inset min-[640px]:col-span-2 min-[980px]:col-span-4">
              <Picture
                media={cover}
                sizes="(min-width: 80rem) 80rem, 100vw"
                eager
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
          ) : drawn ? (
            <div className="grid place-items-center rounded-2xl border border-line bg-surface p-6 min-[640px]:col-span-2">
              <div
                className={`flex w-full max-w-md justify-center ${
                  // The phone keeps its width; the other drawings fill the box.
                  visual === 'booking' ? '' : '[&>*]:w-full'
                }`}
              >
                <ProjectVisual study={study} labels={labels} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="wrap grid grid-cols-1 items-start gap-x-4 gap-y-10 pt-14 pb-18 min-[980px]:grid-cols-12">
        {present.length > 1 ? (
          <Toc
            label={t('toc')}
            entries={present.map((section) => ({ id: section, text: t(section) }))}
            className="min-[980px]:sticky min-[980px]:top-6 min-[980px]:col-span-3"
          />
        ) : null}
        <article
          className={`flex max-w-[45rem] flex-col gap-14 ${
            present.length > 1 ? 'min-[980px]:col-span-9' : 'min-[980px]:col-span-12'
          }`}
        >
          {present.map((section) => (
            <section key={section} aria-labelledby={section} className="flex flex-col gap-4">
              <h2
                id={section}
                className="scroll-mt-6 text-[2rem] leading-[1.15] font-semibold tracking-tight"
              >
                {t(section)}
              </h2>
              <RichText
                data={study[section]}
                locale={locale}
                className="prose-site"
                minLevel={3}
                idPrefix={section}
              />
            </section>
          ))}
          {study.diagram ? (
            <figure className="flex flex-col gap-3">
              <span className="overflow-hidden rounded-2xl border border-line bg-surface">
                <Picture media={study.diagram} sizes="(min-width: 48rem) 48rem, 100vw" />
              </span>
              <figcaption className="font-mono text-[13px] text-muted">{t('diagram')}</figcaption>
            </figure>
          ) : null}
          {study.kind !== 'personal' ? (
            <p className="rounded-xl bg-enduro/14 px-5 py-4">
              <strong className="text-enduro">{t('anonymizedTitle')}</strong> {t('anonymized')}
            </p>
          ) : null}
        </article>
      </div>

      <nav
        aria-label={t('more')}
        className="wrap grid grid-cols-1 gap-4 pb-24 min-[980px]:grid-cols-12"
      >
        <Link
          href={localizedPath('/projets', locale)}
          className="flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint min-[980px]:col-span-4"
        >
          <span className="font-mono text-[13px] text-muted">
            <span aria-hidden="true">← </span>
            {t('back')}
          </span>
          <span className="font-display text-2xl font-semibold">{t('all')}</span>
        </Link>
        {next ? (
          <Link
            href={documentPath('case-studies', next.slug, locale)}
            className="flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-line bg-surface p-6 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint min-[980px]:col-span-8"
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
