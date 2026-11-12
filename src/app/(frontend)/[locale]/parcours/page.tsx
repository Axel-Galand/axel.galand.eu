import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { skillCategories } from '@/collections/Skills'
import { GitLog } from '@/components/background/GitLog'
import { ScoreGauge } from '@/components/background/ScoreGauge'
import { type Accent, accentAt, accents } from '@/components/site/accents'
import { linkLabel } from '@/components/site/links'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import { SectionTitle } from '@/components/site/SectionTitle'
import type { Locale } from '@/i18n/locales'
import { findPublic, findPublicGlobal } from '@/lib/content'
import { formatMonth } from '@/lib/dates'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'
import type { CaseStudy, Experience, Note } from '@/payload-types'

const paths = { fr: localizedPath('/parcours', 'fr'), en: localizedPath('/parcours', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('background')

  return pageMetadata({ locale, paths, title: t('title'), description: t('description') })
}

// Linked documents that are public in this language: unpublished ones stay ids, untranslated ones
// have no title.
const visible = <T extends CaseStudy | Note>(items: (number | T)[] | null | undefined): T[] =>
  (items ?? []).flatMap((item) => (typeof item === 'object' && item.title ? [item] : []))

const highlightColors: Accent[] = ['code', 'route', 'enduro', 'rose', 'violet']

const button =
  'inline-flex min-h-[50px] items-center gap-2.5 rounded-full px-[22px] font-semibold no-underline'

export default async function BackgroundPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('background')
  const [{ docs: experiences }, { docs: skills }, { docs: expertises }, profile] =
    await Promise.all([
      findPublic({
        collection: 'experiences',
        locale,
        sort: ['-start', 'order'],
        limit: 100,
        depth: 1,
      }),
      findPublic({ collection: 'skills', locale, sort: 'order', limit: 300, depth: 0 }),
      findPublic({ collection: 'expertises', locale, sort: 'order', limit: 12, depth: 1 }),
      findPublicGlobal({ slug: 'profile', locale, depth: 0 }),
    ])

  // Array rows hold localized texts that may be missing in this language: skip the empty ones.
  const highlights = (experience: Experience) =>
    (experience.highlights ?? []).filter((highlight) => highlight.text)
  const languages = (profile.languages ?? []).filter((language) => language.language)
  const scored = languages.find((language) => language.score && language.scoreMax)
  // The CV exists once the profile is published in this language (see cv.pdf/route.ts).
  const cv = profile.name && profile.headline ? localizedPath('/cv.pdf', locale) : undefined
  const linkedin = profile.links?.find((link) => link.kind === 'linkedin')

  const details = (experience: Experience) => {
    const related = visible(experience.caseStudies)

    return (
      <>
        {experience.description ? (
          <p className="max-w-[44em] text-ink-2">{experience.description}</p>
        ) : null}
        {highlights(experience).length ? (
          <ul className="flex max-w-[46em] flex-col gap-2.5">
            {highlights(experience).map((highlight, index) => (
              <li
                key={highlight.id ?? highlight.text}
                className="grid grid-cols-[18px_1fr] items-baseline gap-2"
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-[2px] ${accents[highlightColors[index % highlightColors.length]].dot}`}
                />
                <span>{highlight.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {related.length ? (
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
            <span className="text-muted">{t('related')}</span>
            {related.map((study) => (
              <Link key={study.id} href={documentPath('case-studies', study.slug, locale)}>
                {study.title}
              </Link>
            ))}
          </p>
        ) : null}
      </>
    )
  }

  return (
    <PageShell locale={locale} paths={paths} current="background">
      <PageHero
        crumbs={[{ label: t('slug') }]}
        title={t('title')}
        lead={profile.headline ? <p>{profile.headline}</p> : undefined}
      >
        {cv || linkedin ? (
          <div className="mt-2 flex flex-wrap gap-3">
            {cv ? (
              <a
                href={cv}
                type="application/pdf"
                className={`${button} bg-btn text-btn-ink hover:text-btn-ink`}
              >
                {t('cv')}
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 3v10M4.5 9L9 13.5 13.5 9M3 16h12" />
                </svg>
              </a>
            ) : null}
            {linkedin ? (
              <a href={linkedin.url} rel="me" className={`${button} border border-line-strong`}>
                {linkLabel(linkedin)}
              </a>
            ) : null}
          </div>
        ) : null}
      </PageHero>

      <div className="wrap flex flex-col gap-18 pt-2 pb-24">
        {experiences.length ? (
          <section aria-labelledby="timeline" className="flex flex-col gap-6">
            <SectionTitle id="timeline" accent="code">
              {t('timeline')}
            </SectionTitle>
            <GitLog
              experiences={experiences}
              labels={{ present: t('present'), head: 'HEAD' }}
              details={details}
            />
          </section>
        ) : null}

        {expertises.length ? (
          <section aria-labelledby="expertises" className="flex flex-col gap-6">
            <SectionTitle id="expertises" accent="enduro">
              {t('expertises')}
            </SectionTitle>
            <div className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-3">
              {expertises.map((expertise, index) => {
                const accent = accentAt(index)
                const links = [
                  ...visible(expertise.caseStudies).map((study) => ({
                    key: `study-${study.id}`,
                    href: documentPath('case-studies', study.slug, locale),
                    label: study.title,
                  })),
                  ...visible(expertise.notes).map((note) => ({
                    key: `note-${note.id}`,
                    href: documentPath('notes', note.slug, locale),
                    label: note.title,
                  })),
                ]

                return (
                  <article
                    key={expertise.id}
                    className="flex flex-col gap-[18px] rounded-2xl border border-line bg-surface p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2.5">
                        <p
                          className={`self-start rounded-full px-2.5 py-0.5 font-mono text-[13px] ${accents[accent].soft}`}
                        >
                          {t(`categories.${expertise.category}`)}
                        </p>
                        <h3 className="text-4xl leading-none font-bold tracking-tight">
                          {expertise.name}
                          {expertise.version ? (
                            <span className="sr-only"> {expertise.version}</span>
                          ) : null}
                        </h3>
                      </div>
                      {expertise.version ? (
                        <span
                          aria-hidden="true"
                          className={`font-display text-[84px] leading-[0.8] font-bold tracking-[-0.05em] ${accents[accent].text}`}
                        >
                          {expertise.version}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-ink-2">{expertise.description}</p>
                    {links.length ? (
                      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
                        <p className="font-mono text-[13px] text-muted">{t('seenIn')}</p>
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
                          {links.map((link) => (
                            <li key={link.key}>
                              <Link href={link.href} className="block py-2.5">
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {skills.length ? (
          <section aria-labelledby="skills" className="flex flex-col gap-6">
            <SectionTitle id="skills" accent="route">
              {t('skills')}
            </SectionTitle>
            <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[980px]:grid-cols-4">
              {skillCategories
                .map(({ value }) => ({
                  value,
                  names: skills.filter((skill) => skill.category === value).map(({ name }) => name),
                }))
                .filter(({ names }) => names.length)
                .map(({ value, names }, index) => (
                  <div
                    key={value}
                    className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6"
                  >
                    <h3 className="font-mono text-[13px] font-normal text-muted">
                      {t(`categories.${value}`)}
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {names.map((name) => (
                        <li
                          key={name}
                          className={`rounded-full px-3 py-1 text-sm ${accents[accentAt(index)].soft}`}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {languages.length || cv ? (
          <div className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-12">
            {languages.length ? (
              <section
                aria-labelledby="languages"
                className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-2xl border border-line bg-surface p-7 min-[980px]:col-span-7"
              >
                <div className="flex flex-[1_1_240px] flex-col gap-[18px]">
                  <SectionTitle id="languages" accent="rose">
                    {t('languages')}
                  </SectionTitle>
                  <dl className="flex flex-col gap-3.5">
                    {languages.map((language) => (
                      <div key={language.id ?? language.language} className="flex flex-col">
                        <dt className="font-semibold">{language.language}</dt>
                        <dd className="text-ink-2">{language.level}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {scored?.score && scored.scoreMax ? (
                  <ScoreGauge
                    score={scored.score}
                    max={scored.scoreMax}
                    label={
                      scored.test
                        ? t('score', {
                            test: scored.test,
                            score: scored.score,
                            max: scored.scoreMax,
                          })
                        : t('scoreAlone', { score: scored.score, max: scored.scoreMax })
                    }
                  />
                ) : null}
              </section>
            ) : null}
            {cv ? (
              <a
                href={cv}
                type="application/pdf"
                className="flex flex-col justify-between gap-8 rounded-2xl bg-code-fill p-7 text-on-fill no-underline transition-transform duration-200 hover:-translate-y-[3px] hover:text-on-fill min-[980px]:col-span-5"
              >
                <span className="flex items-center justify-between font-mono text-[13px]">
                  cv.pdf
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4v11M6 10.5l5 5 5-5M4 19h14" />
                  </svg>
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[40px] leading-none font-bold tracking-tight">
                    {t('cvTitle')}
                  </span>
                  <span className="text-[15px] font-medium">{t('cvBody')}</span>
                </span>
              </a>
            ) : null}
          </div>
        ) : null}

        {profile.certifications?.length ? (
          <section aria-labelledby="certifications" className="flex flex-col gap-6">
            <SectionTitle id="certifications" accent="violet">
              {t('certifications')}
            </SectionTitle>
            <ul className="flex flex-col border-t border-line">
              {profile.certifications.map((certification) => (
                <li
                  key={certification.id ?? certification.name}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line px-3 py-5"
                >
                  <span className="font-display text-xl font-semibold">
                    {certification.url ? (
                      <a href={certification.url}>{certification.name}</a>
                    ) : (
                      certification.name
                    )}
                  </span>
                  <span className="font-mono text-[13px] text-muted">
                    {[
                      certification.issuer,
                      certification.date ? formatMonth(certification.date, locale) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </PageShell>
  )
}
