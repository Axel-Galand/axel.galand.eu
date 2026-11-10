import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { draftMode } from 'next/headers'
import React from 'react'

import { SiteFooter } from '@/components/site/SiteFooter'
import type { Locale } from '@/i18n/locales'
import { isIndexable } from '@/lib/seo/indexing'
import { getServerURL } from '@/lib/serverURL'
import { themeScript } from '@/lib/theme'

import { display, mono, sans } from '../fonts'
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

  return (
    // The theme script sets data-theme before React hydrates.
    <html
      lang={locale}
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <a
          className="absolute -left-[999px] z-10 rounded-lg bg-btn px-4 py-3 text-btn-ink focus:top-4 focus:left-4"
          href="#main"
        >
          {t('skip')}
        </a>
        {preview ? (
          <p
            className="border-b border-enduro bg-enduro/14 px-5 py-2.5 text-center text-sm"
            role="status"
          >
            {tPreview('banner')}{' '}
            {/* A route handler, not a page: <Link> would prefetch it and end the preview on hover. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/next/exit-preview" className="font-semibold underline">
              {tPreview('exit')}
            </a>
          </p>
        ) : null}
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  )
}
