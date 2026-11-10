import type { Locale } from '@/i18n/locales'

import { type Section, SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  paths: Partial<Record<Locale, string>>
  current?: Section
  /** Pages not redesigned yet keep a plain column (the `.legacy` styles). */
  legacy?: boolean
  children: React.ReactNode
}

/** The header and the main landmark of every page; the footer is in the layout. */
export function PageShell({ locale, paths, current, legacy = false, children }: Props) {
  return (
    <>
      <SiteHeader locale={locale} paths={paths} current={current} />
      <main id="main" className={legacy ? 'wrap' : undefined}>
        {legacy ? <div className="legacy">{children}</div> : children}
      </main>
    </>
  )
}
