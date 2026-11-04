import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Picture } from '@/components/Picture'
import type { Locale } from '@/i18n/locales'
import { findPublic } from '@/lib/content'
import { documentPath, localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'

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

  return (
    <>
      <LanguageSwitch locale={locale} paths={paths} />
      <h1>{t('title')}</h1>
      <p className="lead">{t('description')}</p>
      {docs.length ? (
        <ul className="grid">
          {docs.map((album) => (
            <li key={album.id}>
              <Link href={documentPath('albums', album.slug, locale)}>
                <Picture media={album.cover} sizes="(min-width: 48rem) 15rem, 50vw" />
                <strong>{album.title}</strong>
              </Link>
              <p className="muted">
                {t('season', { season: album.season })} ·{' '}
                {t('photos', { count: album.photos?.length ?? 0 })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('empty')}</p>
      )}
    </>
  )
}
