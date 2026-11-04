import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'

export default async function NotFound() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notFound')

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('body')}</p>
      <p>
        <Link href={localizedPath('/', locale)}>{t('back')}</Link>
      </p>
    </>
  )
}
