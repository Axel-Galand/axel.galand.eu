import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { GitLog } from '@/components/background/GitLog'
import { EditorWindow } from '@/components/home/EditorWindow'
import { Marquee } from '@/components/home/Marquee'
import { WeekGauge } from '@/components/home/WeekGauge'
import { JsonLd } from '@/components/JsonLd'
import { Picture } from '@/components/Picture'
import { ProjectCard, projectSpan } from '@/components/projects/ProjectCard'
import { projectCardLabels } from '@/components/projects/labels'
import { RichText } from '@/components/RichText'
import { accentAt, accents } from '@/components/site/accents'
import { Universes } from '@/components/personal/Universes'
import { PageShell } from '@/components/site/PageShell'
import { SectionTitle } from '@/components/site/SectionTitle'
import { Tread } from '@/components/visuals/illustrations'
import type { Locale } from '@/i18n/locales'
import { findPublic, findPublicGlobal } from '@/lib/content'
import { documentPath, localizedPath } from '@/lib/paths'
import { person } from '@/lib/seo/jsonLd'
import { pageMetadata, seoFields } from '@/lib/seo/metadata'
import { absoluteURL } from '@/lib/urls'
import type { Experience } from '@/payload-types'

// The home page exists in both languages; untranslated content is simply left out of /en.
const paths = { fr: localizedPath('/', 'fr'), en: localizedPath('/', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const [profile, settings] = await Promise.all([
    findPublicGlobal({ slug: 'profile', locale, depth: 1 }),
    findPublicGlobal({ slug: 'site-settings', locale, depth: 1 }),
  ])

  const fields = seoFields(profile, {
    title: settings.defaultTitle,
    description: settings.defaultDescription || profile.headline,
    image: settings.defaultOgImage,
  })
  // The home page carries the name alone: the layout's template would add it a second time, and
  // an empty SEO title would leave the page without any <title>.
  const title = fields.title || profile.name || 'Axel Galand'
  const metadata = pageMetadata({ locale, paths, type: 'profile', ...fields, title })

  return { ...metadata, title: { absolute: title } }
}

const year = (date: string | null | undefined) => (date ? new Date(date).getUTCFullYear() : null)

const months = (experience: Experience) => {
  const start = new Date(experience.start).getTime()
  const end = experience.end ? new Date(experience.end).getTime() : Date.now()
  const length = (end - start) / (30 * 24 * 3600 * 1000)

  return Number.isFinite(length) ? Math.max(1, length) : 1
}

const card = 'rounded-2xl border border-line bg-surface'

export default async function HomePage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('home')
  const cardLabels = await projectCardLabels()

  const [
    profile,
    { docs: studies },
    { docs: experiences },
    { docs: skills },
    { docs: expertises },
    { docs: featuredNotes },
    { docs: latestNotes },
    { docs: albums },
  ] = await Promise.all([
    findPublicGlobal({ slug: 'profile', locale, depth: 1 }),
    findPublic({
      collection: 'case-studies',
      locale,
      where: { featured: { equals: true } },
      sort: 'order',
      limit: 6,
      depth: 1,
    }),
    findPublic({
      collection: 'experiences',
      locale,
      sort: ['-start', 'order'],
      limit: 50,
      depth: 0,
    }),
    findPublic({ collection: 'skills', locale, sort: 'order', limit: 300, depth: 0 }),
    findPublic({ collection: 'expertises', locale, sort: 'order', limit: 12, depth: 0 }),
    findPublic({
      collection: 'notes',
      locale,
      where: { featured: { equals: true } },
      sort: '-publishedAt',
      limit: 1,
      depth: 1,
    }),
    findPublic({ collection: 'notes', locale, sort: '-publishedAt', limit: 3, depth: 1 }),
    findPublic({ collection: 'albums', locale, sort: ['-season', 'order'], limit: 4, depth: 1 }),
  ])

  const name = profile.name || 'Axel Galand'
  const firstName = name.split(' ')[0]
  // Drafts skip validation: in preview, an entry may have no start date yet.
  const jobs = experiences.filter((experience) => experience.kind === 'job' && experience.start)
  const current = jobs.find((job) => !job.end)
  const firstYear = Math.min(...jobs.map((job) => year(job.start) ?? Infinity))
  const tenure = current
    ? jobs
        .filter((job) => job.organization === current.organization)
        .sort((a, b) => a.start.localeCompare(b.start))
    : []
  const featured = studies[0]
  const leadNote = featuredNotes[0] ?? latestNotes[0]
  const otherNotes = latestNotes.filter((note) => note.id !== leadNote?.id).slice(0, 2)
  const personalPath = localizedPath('/perso', locale)

  return (
    <PageShell locale={locale} paths={paths}>
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

      <section className="dots">
        <div className="wrap grid items-start gap-14 py-[clamp(3rem,6vw,6rem)] min-[980px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-7">
            <p className="font-mono text-sm text-muted">
              {[profile.location, current?.role, current?.organization].filter(Boolean).join(' · ')}
            </p>
            <h1 className="text-[clamp(2.5rem,4.7vw,4.125rem)] leading-[1.08] font-bold tracking-[-0.03em]">
              {t.rich('title', {
                firstName,
                line: (chunks) => <span className="block">{chunks}</span>,
                code: (chunks) => (
                  <span className="font-mono font-bold tracking-[-0.04em] text-code">{chunks}</span>
                ),
                road: (chunks) => (
                  <span className="text-route underline decoration-dashed decoration-4 underline-offset-[10px]">
                    {chunks}
                  </span>
                ),
                trail: (chunks) => (
                  <span className="text-enduro underline decoration-dotted decoration-[5px] underline-offset-[10px]">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <RichText
              data={profile.bio}
              locale={locale}
              className="flex max-w-[34em] flex-col gap-3 text-[clamp(1.125rem,1.4vw,1.25rem)] text-ink-2"
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href={localizedPath('/projets', locale)}
                className="inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-btn px-[22px] font-semibold text-btn-ink no-underline hover:text-btn-ink"
              >
                {t('projects')}
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9h11M10 4l5 5-5 5" />
                </svg>
              </Link>
              <Link
                href={personalPath}
                className="inline-flex min-h-[50px] items-center rounded-full border border-line-strong px-[22px] font-semibold no-underline"
              >
                {t('offScreen')}
              </Link>
            </div>
          </div>
          <EditorWindow
            file={`${firstName.toLowerCase()}.ts`}
            role={current?.role}
            base={profile.location}
            stack={(expertises.length
              ? expertises.map((item) => item.name)
              : skills.map((skill) => skill.name)
            ).slice(0, 3)}
            since={Number.isFinite(firstYear) ? firstYear : null}
          />
        </div>
      </section>

      <div className="wrap grid grid-cols-1 gap-4 pb-14 min-[980px]:grid-cols-3">
        {skills.length ? (
          <Marquee
            items={skills.map((skill, index) => ({
              name: skill.name,
              separator: accents[accentAt(index)].text,
            }))}
            summary={t('stack', { list: skills.map((skill) => skill.name).join(', ') })}
            pauseLabel={t('pauseStack')}
          />
        ) : null}

        {featured ? (
          <Link
            href={documentPath('case-studies', featured.slug, locale)}
            className="flex min-h-[270px] flex-col justify-between gap-6 rounded-2xl bg-code-fill p-6 text-on-fill no-underline transition-transform duration-200 hover:-translate-y-[3px] hover:text-on-fill"
          >
            <span className="flex items-center justify-between font-mono text-[13px]">
              {t('featuredProject')}
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 16L16 6M8 6h8v8" />
              </svg>
            </span>
            <span className="flex flex-col gap-1">
              {featured.metrics?.length ? (
                <>
                  <span className="font-display text-[64px] leading-[0.95] font-bold tracking-tight">
                    {featured.metrics[0].value} {featured.metrics[0].label}
                  </span>
                  {featured.metrics[1] ? (
                    <span className="font-display text-[30px] leading-[1.1] font-semibold">
                      {featured.metrics[1].value} {featured.metrics[1].label}
                    </span>
                  ) : null}
                  <span className="text-[15px] font-medium">{featured.title}</span>
                </>
              ) : (
                <span className="font-display text-[34px] leading-[1.1] font-bold">
                  {featured.title}
                </span>
              )}
            </span>
          </Link>
        ) : null}

        {current ? (
          <div className={`${card} flex min-h-[270px] flex-col justify-between gap-6 p-6`}>
            <span className="inline-flex items-center gap-2 font-mono text-[13px] text-muted">
              <span aria-hidden="true" className="size-2 animate-blink rounded-full bg-code" />
              {t('currentJob')}
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="font-display text-[40px] leading-none font-bold tracking-tight">
                {current.organization}
              </span>
              <span className="text-ink-2">
                {current.location
                  ? t('jobAt', { role: current.role, location: current.location })
                  : current.role}
              </span>
            </span>
            <ol
              className="grid gap-1 font-mono text-xs text-muted"
              style={{ gridTemplateColumns: tenure.map((job) => `${months(job)}fr`).join(' ') }}
            >
              {tenure.map((job, index) => (
                <li key={job.id} className="flex flex-col gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 rounded-full ${index === tenure.length - 1 ? 'bg-code' : 'bg-violet'}`}
                  />
                  {job.end ? year(job.start) : t('since', { year: year(job.start) ?? '' })}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <WeekGauge
          title={t('week')}
          value={t('weekValue')}
          unit={t('weekUnit')}
          label={t('weekLabel')}
          legend={{ code: t('code'), road: t('road'), enduro: t('enduro') }}
        />
      </div>

      <Tread />

      {studies.length ? (
        <section aria-labelledby="projects" className="wrap flex flex-col gap-7 pb-22">
          <SectionTitle
            id="projects"
            accent="code"
            more={{ href: localizedPath('/projets', locale), label: t('allProjects') }}
          >
            {t('projectsTitle')}
          </SectionTitle>
          <div className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-12">
            {studies.map((study, index) => {
              const span = projectSpan(index, studies.length)

              return (
                <ProjectCard
                  key={study.id}
                  study={study}
                  href={documentPath('case-studies', study.slug, locale)}
                  number={index + 1}
                  accent={accentAt(index)}
                  wide={!span.endsWith('5')}
                  labels={cardLabels}
                  className={span}
                />
              )
            })}
          </div>
        </section>
      ) : null}

      {experiences.length ? (
        <section
          aria-labelledby="background"
          className="wrap grid grid-cols-1 items-start gap-4 pb-22 min-[980px]:grid-cols-12"
        >
          <div className="flex flex-col gap-5 min-[980px]:col-span-4">
            <SectionTitle id="background" accent="violet">
              {t('backgroundTitle')}
            </SectionTitle>
            {profile.headline ? <p className="text-ink-2">{profile.headline}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Link
                href={localizedPath('/parcours', locale)}
                className="inline-flex min-h-[46px] items-center rounded-full border border-line-strong px-5 text-[15px] font-semibold no-underline"
              >
                {t('allBackground')}
              </Link>
              {/* The CV exists once the profile is published in this language (see cv.pdf/route.ts). */}
              {profile.name && profile.headline ? (
                <a
                  href={localizedPath('/cv.pdf', locale)}
                  type="application/pdf"
                  className="inline-flex min-h-[46px] items-center rounded-full border border-line-strong px-5 text-[15px] font-semibold no-underline"
                >
                  {t('cv')}
                </a>
              ) : null}
            </div>
          </div>
          <div className="min-[980px]:col-span-8">
            <GitLog
              experiences={experiences.slice(0, 5)}
              labels={{ present: t('present'), head: 'HEAD' }}
              descriptions
            />
          </div>
        </section>
      ) : null}

      {leadNote ? (
        <section aria-labelledby="notes" className="wrap flex flex-col gap-7 pb-22">
          <SectionTitle
            id="notes"
            accent="rose"
            more={{ href: localizedPath('/notes', locale), label: t('allNotes') }}
          >
            {t('notesTitle')}
          </SectionTitle>
          <div className="grid grid-cols-1 items-start gap-4 min-[980px]:grid-cols-12">
            <Link
              href={documentPath('notes', leadNote.slug, locale)}
              className={`${card} flex flex-col gap-[18px] p-7 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint min-[980px]:col-span-7`}
            >
              <span className="flex flex-wrap gap-2 font-mono text-[13px]">
                {leadNote.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-rose/14 px-2.5 py-0.5 text-rose">
                    {tag}
                  </span>
                ))}
                {leadNote.featured ? (
                  <span className="py-0.5 text-muted">{t('featuredNote')}</span>
                ) : null}
              </span>
              <h3 className="text-[30px] leading-[1.15] font-semibold">{leadNote.title}</h3>
              <span className="text-ink-2">{leadNote.excerpt}</span>
              {leadNote.cover ? (
                <span className="block overflow-hidden rounded-xl border border-line">
                  <Picture
                    media={leadNote.cover}
                    sizes="(min-width: 980px) 45vw, 100vw"
                    className="aspect-[16/9] w-full object-cover"
                  />
                </span>
              ) : null}
            </Link>
            <ul className="flex flex-col border-t border-line min-[980px]:col-span-5">
              {otherNotes.map((note, index) => (
                <li key={note.id} className="border-b border-line">
                  <Link
                    href={documentPath('notes', note.slug, locale)}
                    className="flex flex-col gap-2.5 px-3 py-6 no-underline transition-colors hover:bg-surface"
                  >
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
                    <h3 className="text-[22px] leading-[1.2] font-semibold">{note.title}</h3>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={localizedPath('/notes/rss.xml', locale)}
                  type="application/rss+xml"
                  className="inline-flex items-center gap-2.5 px-3 py-5 font-mono text-sm no-underline"
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-enduro"
                  >
                    <path d="M2 8a6 6 0 016 6M2 3a11 11 0 0111 11" />
                    <circle cx="3" cy="13" r="1" fill="currentColor" />
                  </svg>
                  {t('rss')}
                </a>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="personal" className="wrap flex flex-col gap-7 pb-22">
        <SectionTitle
          id="personal"
          accent="enduro"
          more={albums.length ? { href: personalPath, label: t('allAlbums') } : undefined}
        >
          {t('personalTitle')}
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-12">
          <Universes href={personalPath} />
          {albums.map((album) => (
            <Link
              key={album.id}
              href={documentPath('albums', album.slug, locale)}
              className="group relative block overflow-hidden rounded-2xl border border-line bg-inset no-underline min-[980px]:col-span-3"
            >
              <Picture
                media={album.cover}
                sizes="(min-width: 980px) 25vw, 100vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-lg bg-veil px-3 py-2 text-sm">
                <span className="truncate font-semibold">{album.title}</span>
                <span
                  className={`font-mono text-[13px] ${album.category === 'road' ? 'text-route' : 'text-enduro'}`}
                >
                  {t(album.category === 'road' ? 'road' : 'enduro')}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
