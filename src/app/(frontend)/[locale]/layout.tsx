import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'
import { isIndexable } from '@/lib/seo/indexing'
import { getServerURL } from '@/lib/serverURL'

import '../styles.css'

// Nothing renders at build time, which has no database: each page renders on its first visit,
// then stays cached until content changes (see src/plugins/revalidateSite.ts).
export const generateStaticParams = () => []

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(getServerURL()),
    title: { default: 'Axel Galand', template: '%s · Axel Galand' },
    // The X-Robots-Tag header set in proxy.ts says the same for every response.
    robots: isIndexable() ? undefined : { index: false, follow: false },
  }
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('site')
  const preview = (await draftMode()).isEnabled
  const tPreview = await getTranslations('preview')

  const nav = [
    { href: localizedPath('/projets', locale), label: t('projects') },
    { href: localizedPath('/parcours', locale), label: t('background') },
    { href: localizedPath('/notes', locale), label: t('notes') },
    { href: localizedPath('/perso', locale), label: t('personal') },
  ]

  return (
    <html lang={locale}>
      <body>
        <a className="skip" href="#main">
          {t('skip')}
        </a>
        {preview ? (
          <p className="preview" role="status">
            {tPreview('banner')}{' '}
            {/* A route handler, not a page: <Link> would prefetch it and end the preview on hover. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/next/exit-preview">{tPreview('exit')}</a>
          </p>
        ) : null}
        <header className="site-header">
          <Link className="site-name" href={localizedPath('/', locale)}>
            Axel Galand
          </Link>
          <nav aria-label={t('nav')}>
            <ul>
              {nav.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <ul>
            <li>
              <Link href={localizedPath('/mentions-legales', locale)}>{t('legal')}</Link>
            </li>
            <li>
              <a href={localizedPath('/notes/rss.xml', locale)} type="application/rss+xml">
                {t('rss')}
              </a>
            </li>
          </ul>
        </footer>
      </body>
    </html>
  )
}
