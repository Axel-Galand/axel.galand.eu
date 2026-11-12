import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { ProjectCard, projectSpan } from '@/components/projects/ProjectCard'
import { projectCardLabels } from '@/components/projects/labels'
import { accentAt } from '@/components/site/accents'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import type { Locale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
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
  const [{ docs }, labels] = await Promise.all([
    findPublic({ collection: 'case-studies', locale, sort: 'order', limit: 100, depth: 1 }),
    projectCardLabels(),
  ])

  return (
    <PageShell locale={locale} paths={paths} current="projects">
      <PageHero crumbs={[{ label: t('slug') }]} title={t('title')} lead={<p>{t('lead')}</p>} />
      <div className="wrap grid grid-cols-1 gap-4 pt-2 pb-24 min-[980px]:grid-cols-12">
        {docs.length ? (
          docs.map((study, index) => {
            const span = projectSpan(index, docs.length)

            return (
              <ProjectCard
                key={study.id}
                study={study}
                href={documentPath('case-studies', study.slug, locale)}
                number={index + 1}
                accent={accentAt(index)}
                wide={!span.endsWith('5')}
                labels={labels}
                className={span}
                heading="h2"
              />
            )
          })
        ) : (
          <p className="text-ink-2 min-[980px]:col-span-12">{t('empty')}</p>
        )}
      </div>
    </PageShell>
  )
}
