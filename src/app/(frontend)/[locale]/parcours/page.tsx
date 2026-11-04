import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { skillCategories } from '@/collections/Skills'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import type { Locale } from '@/i18n/locales'
import { findPublic, findPublicGlobal } from '@/lib/content'
import { formatMonth, formatPeriod } from '@/lib/dates'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'
import type { Experience } from '@/payload-types'

const paths = { fr: localizedPath('/parcours', 'fr'), en: localizedPath('/parcours', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('background')

  return pageMetadata({ locale, paths, title: t('title'), description: t('description') })
}

export default async function BackgroundPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('background')
  const tProjects = await getTranslations('projects')
  const [{ docs: experiences }, { docs: skills }, profile] = await Promise.all([
    findPublic({
      collection: 'experiences',
      locale,
      sort: ['-start', 'order'],
      limit: 100,
      depth: 1,
    }),
    findPublic({ collection: 'skills', locale, sort: 'order', limit: 300, depth: 0 }),
    findPublicGlobal({ slug: 'profile', locale, depth: 0 }),
  ])

  // Array rows hold localized texts that may be missing in this language: skip the empty ones.
  const highlights = (experience: Experience) =>
    (experience.highlights ?? []).filter((highlight) => highlight.text)
  const languages = (profile.languages ?? []).filter((language) => language.language)

  const timeline = (kind: Experience['kind']) =>
    experiences
      .filter((experience) => experience.kind === kind)
      .map((experience) => {
        // Linked case studies that are public in this language (unpublished ones stay ids).
        const related = (experience.caseStudies ?? []).flatMap((study) =>
          typeof study === 'object' && study.title ? [study] : [],
        )

        return (
          <li key={experience.id}>
            <h3>
              {experience.role} · {experience.organization}
            </h3>
            <p className="muted">
              {formatPeriod(experience.start, experience.end, locale, tProjects('present'))}
              {experience.location ? ` · ${experience.location}` : null}
            </p>
            {experience.description ? <p>{experience.description}</p> : null}
            {highlights(experience).length ? (
              <ul>
                {highlights(experience).map((highlight) => (
                  <li key={highlight.id ?? highlight.text}>{highlight.text}</li>
                ))}
              </ul>
            ) : null}
            {related.length ? (
              <p>
                {t('related')}
                {locale === 'fr' ? ' : ' : ': '}
                {related.map((study, index) => (
                  <span key={study.id}>
                    {index ? ', ' : null}
                    <Link href={documentPath('case-studies', study.slug, locale)}>
                      {study.title}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </li>
        )
      })

  const jobs = timeline('job')
  const education = timeline('education')

  return (
    <>
      <LanguageSwitch locale={locale} paths={paths} />
      <h1>{t('title')}</h1>
      {/* The CV exists once the profile is published in this language (see cv.pdf/route.ts). */}
      {profile.name && profile.headline ? (
        <p>
          <a href={localizedPath('/cv.pdf', locale)} type="application/pdf">
            {t('cv')}
          </a>
        </p>
      ) : null}
      {jobs.length ? (
        <section>
          <h2>{t('jobs')}</h2>
          <ol className="cards">{jobs}</ol>
        </section>
      ) : null}
      {education.length ? (
        <section>
          <h2>{t('education')}</h2>
          <ol className="cards">{education}</ol>
        </section>
      ) : null}
      {skills.length ? (
        <section>
          <h2>{t('skills')}</h2>
          <dl>
            {skillCategories.map(({ value }) => {
              const names = skills
                .filter((skill) => skill.category === value)
                .map(({ name }) => name)

              return names.length ? (
                <div key={value}>
                  <dt>{t(`categories.${value}`)}</dt>
                  <dd>{names.join(', ')}</dd>
                </div>
              ) : null
            })}
          </dl>
        </section>
      ) : null}
      {languages.length ? (
        <section>
          <h2>{t('languages')}</h2>
          <ul>
            {languages.map((language) => (
              <li key={language.id ?? language.language}>
                {language.language} · {language.level}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {profile.certifications?.length ? (
        <section>
          <h2>{t('certifications')}</h2>
          <ul>
            {profile.certifications.map((certification) => (
              <li key={certification.id ?? certification.name}>
                {certification.url ? (
                  <a href={certification.url}>{certification.name}</a>
                ) : (
                  certification.name
                )}
                {certification.issuer ? ` · ${certification.issuer}` : null}
                {certification.date ? ` · ${formatMonth(certification.date, locale)}` : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
