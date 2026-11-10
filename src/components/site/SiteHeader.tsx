import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'

import { ThemeToggle } from './ThemeToggle'

export type Section = 'projects' | 'background' | 'notes' | 'personal'

type Props = {
  locale: Locale
  /** The page's path in each locale where it exists; otherwise the switch leads to that home page. */
  paths: Partial<Record<Locale, string>>
  current?: Section
}

/** Rendered by each page, so the language switch leads to this very document in the other language. */
export async function SiteHeader({ locale, paths, current }: Props) {
  const t = await getTranslations('site')
  const other: Locale = locale === 'fr' ? 'en' : 'fr'

  const nav: { section: Section; href: string }[] = [
    { section: 'projects', href: localizedPath('/projets', locale) },
    { section: 'background', href: localizedPath('/parcours', locale) },
    { section: 'notes', href: localizedPath('/notes', locale) },
    { section: 'personal', href: localizedPath('/perso', locale) },
  ]

  return (
    <header className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
      <Link
        href={localizedPath('/', locale)}
        className="order-1 inline-flex min-h-11 items-center gap-3 font-display text-lg font-bold no-underline"
      >
        <span aria-hidden="true" className="inline-flex gap-1">
          <span className="size-2.5 rounded-full bg-code" />
          <span className="size-2.5 rounded-full bg-route" />
          <span className="size-2.5 rounded-full bg-enduro" />
        </span>
        Axel Galand
      </Link>
      <nav
        aria-label={t('nav')}
        className="order-3 w-full text-[15px] min-[760px]:order-2 min-[760px]:ml-auto min-[760px]:w-auto"
      >
        <ul className="-mx-3 flex flex-wrap items-center gap-x-1 gap-y-1 min-[760px]:mx-0 min-[760px]:gap-x-2">
          {nav.map(({ section, href }) => (
            <li key={section}>
              <Link
                href={href}
                aria-current={
                  current === section ? (paths[locale] === href ? 'page' : 'true') : undefined
                }
                className="block rounded-full border border-transparent px-3 py-3 no-underline aria-[current]:border-line-strong aria-[current]:bg-surface aria-[current]:font-semibold min-[760px]:px-3.5"
              >
                {t(section)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Phones show name and controls on the first line, the sections below; the reading order
          stays name, sections, controls everywhere. */}
      <div className="order-2 flex items-center gap-2 min-[760px]:order-3">
        <a
          href={paths[other] ?? localizedPath('/', other)}
          hrefLang={other}
          lang={other}
          aria-label={t('switchLabel')}
          className="rounded-full border border-line-strong px-3.5 py-2.5 font-mono text-[13px] no-underline"
        >
          {t('switchTo')}
        </a>
        <ThemeToggle label={t('darkTheme')} />
      </div>
    </header>
  )
}
