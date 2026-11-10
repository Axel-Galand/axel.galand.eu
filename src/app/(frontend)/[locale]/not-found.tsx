import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { PageShell } from '@/components/site/PageShell'
import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'

export default async function NotFound() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notFound')

  const paths = { fr: localizedPath('/', 'fr'), en: localizedPath('/', 'en') }

  return (
    <PageShell locale={locale} paths={paths} legacy>
      <h1>{t('title')}</h1>
      <p>{t('body')}</p>
      <p>
        <Link href={localizedPath('/', locale)}>{t('back')}</Link>
      </p>
    </PageShell>
  )
}
