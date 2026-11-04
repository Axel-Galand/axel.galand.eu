import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'

type Props = {
  locale: Locale
  /** The page's path in each locale where it exists; otherwise the switch leads to that home page. */
  paths: Partial<Record<Locale, string>>
}

export async function LanguageSwitch({ locale, paths }: Props) {
  const t = await getTranslations('site')
  const other: Locale = locale === 'fr' ? 'en' : 'fr'

  return (
    <a
      className="language"
      href={paths[other] ?? localizedPath('/', other)}
      hrefLang={other}
      lang={other}
      aria-label={t('switchLabel')}
    >
      {t('switchTo')}
    </a>
  )
}
