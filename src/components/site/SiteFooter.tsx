import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import type { Locale } from '@/i18n/locales'
import { findPublicGlobal } from '@/lib/content'
import { localizedPath } from '@/lib/paths'

import { linkLabel } from './links'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations('site')
  const profile = await findPublicGlobal({ slug: 'profile', locale, depth: 0 })
  const [user, domain] = profile.email?.split('@') ?? []

  return (
    <footer className="mt-auto border-t border-line">
      <div className="wrap flex flex-wrap items-end justify-between gap-x-16 gap-y-8 py-14">
        {profile.email ? (
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-sm text-muted">{t('contact')}</p>
            <a
              href={`mailto:${profile.email}`}
              className="font-display text-[clamp(1.5rem,3.4vw,2.75rem)] font-bold tracking-tight [overflow-wrap:anywhere] no-underline"
            >
              {user}
              <span className="text-code">@</span>
              {domain}
            </a>
          </div>
        ) : null}
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
          {profile.links?.map((link) => (
            <li key={link.id ?? link.url}>
              <a href={link.url} rel="me" className="block py-3">
                {linkLabel(link)}
              </a>
            </li>
          ))}
          <li>
            <a
              href={localizedPath('/notes/rss.xml', locale)}
              type="application/rss+xml"
              className="block py-3"
            >
              {t('rss')}
            </a>
          </li>
          <li>
            <Link href={localizedPath('/mentions-legales', locale)} className="block py-3">
              {t('legal')}
            </Link>
          </li>
        </ul>
      </div>
      <div className="bg-code-fill text-on-fill">
        <p className="wrap flex flex-wrap justify-between gap-x-6 gap-y-1 py-2.5 font-mono text-[13px] font-medium">
          <span>⎇ prod · Next.js · Payload</span>
          <span>{[profile.location, 'FR | EN'].filter(Boolean).join(' · ')}</span>
        </p>
      </div>
    </footer>
  )
}
