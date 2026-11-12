import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { AlbumCard } from '@/components/personal/AlbumCard'
import { Universes } from '@/components/personal/Universes'
import { PageHero } from '@/components/site/PageHero'
import { PageShell } from '@/components/site/PageShell'
import { SectionTitle } from '@/components/site/SectionTitle'
import type { Locale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'
import type { Album } from '@/payload-types'

const paths = { fr: localizedPath('/perso', 'fr'), en: localizedPath('/perso', 'en') }

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('personal')

  return pageMetadata({ locale, paths, title: t('title'), description: t('description') })
}

export default async function PersonalPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('personal')
  const { docs } = await findPublic({
    collection: 'albums',
    locale,
    sort: ['-season', 'order'],
    limit: 100,
    depth: 1,
  })

  const meta = (album: Album) =>
    [
      album.place,
      album.season ? t('season', { season: album.season }) : null,
      t('photos', { count: album.photos?.length ?? 0 }),
    ]
      .filter(Boolean)
      .join(' · ')

  // In preview, a draft without a slug or title yet has no page to link to.
  const albums = docs.filter((album) => album.slug && album.title)
  // Albums saved before the field existed count as enduro, its default.
  const groups = [
    {
      key: 'enduro',
      accent: 'enduro',
      albums: albums.filter((album) => album.category !== 'road'),
    },
    { key: 'road', accent: 'route', albums: albums.filter((album) => album.category === 'road') },
  ] as const

  return (
    <PageShell locale={locale} paths={paths} current="personal">
      <PageHero crumbs={[{ label: t('slug') }]} title={t('title')} lead={<p>{t('lead')}</p>} />

      <div className="wrap flex flex-col gap-18 pt-2 pb-24">
        <div className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-12">
          <Universes href={paths[locale]} heading="h2" />
        </div>

        {groups.map(({ key, accent, albums }) => (
          <section
            key={key}
            id={key}
            aria-labelledby={`${key}-title`}
            className="flex scroll-mt-6 flex-col gap-6"
          >
            <SectionTitle id={`${key}-title`} accent={accent}>
              {t(key === 'road' ? 'roadAlbums' : 'enduroAlbums')}
            </SectionTitle>
            {albums.length ? (
              <ul className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[980px]:grid-cols-3">
                {albums.map((album) => (
                  <li key={album.id}>
                    <AlbumCard
                      album={album}
                      href={documentPath('albums', album.slug, locale)}
                      meta={meta(album)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-2">{t('empty')}</p>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  )
}
