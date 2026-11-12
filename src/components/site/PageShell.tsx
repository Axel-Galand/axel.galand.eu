import type { Locale } from '@/i18n/locales'

import { type Section, SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  paths: Partial<Record<Locale, string>>
  current?: Section
  children: React.ReactNode
}

/** The header and the main landmark of every page; the footer is in the layout. */
export function PageShell({ locale, paths, current, children }: Props) {
  return (
    <>
      <SiteHeader locale={locale} paths={paths} current={current} />
      <main id="main">{children}</main>
    </>
  )
}
