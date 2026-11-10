import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { PageShell } from '@/components/site/PageShell'
import type { Locale } from '@/i18n/locales'
import { findPublicGlobal } from '@/lib/content'
import { localizedPath } from '@/lib/paths'
import { pageMetadata } from '@/lib/seo/metadata'

const paths = {
  fr: localizedPath('/mentions-legales', 'fr'),
  en: localizedPath('/mentions-legales', 'en'),
}

// The host's identity, as French law (LCEN, art. 6) requires it. Source: PulseHeberg's terms.
const host = {
  name: 'PulseHeberg SAS',
  address: '9 boulevard de Strasbourg, 83000 Toulon, France',
  registration: 'RCS Toulon 824 070 619',
  website: 'https://pulseheberg.com',
}

const sourceCode = 'https://github.com/Axel-Galand/axel.galand.eu'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('legal')

  return pageMetadata({ locale, paths, title: t('title') })
}

export default async function LegalNoticePage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('legal')
  const profile = await findPublicGlobal({ slug: 'profile', locale, depth: 0 })
  const name = profile.name || 'Axel Galand'
  const email = profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null

  return (
    <PageShell locale={locale} paths={paths} legacy>
      <h1>{t('title')}</h1>
      {locale === 'fr' ? (
        <>
          <h2>Éditeur</h2>
          <p>
            Ce site est édité par {name}, à titre personnel et non professionnel, qui en est aussi
            le directeur de la publication.{email ? <> Contact : {email}.</> : null}
          </p>
          <h2>Hébergement</h2>
          <p>
            {host.name}, {host.address}. {host.registration}.{' '}
            <a href={host.website}>pulseheberg.com</a>
          </p>
          <p>Les images sont servies par Cloudinary (cloudinary.com).</p>
          <h2>Cookies et données personnelles</h2>
          <p>
            Ce site n&apos;utilise ni mesure d&apos;audience, ni publicité, ni cookie de suivi. Le
            seul cookie possible, <code>NEXT_LOCALE</code>, retient la langue choisie le temps de la
            visite.
          </p>
          <h2>Contenus</h2>
          <p>
            Les textes et les photos sont de {name}, sauf mention contraire. Le code source du site
            est public : <a href={sourceCode}>github.com/Axel-Galand/axel.galand.eu</a>.
          </p>
        </>
      ) : (
        <>
          <h2>Publisher</h2>
          <p>
            This site is published by {name}, as a private individual, who is also its editor.
            {email ? <> Contact: {email}.</> : null}
          </p>
          <h2>Hosting</h2>
          <p>
            {host.name}, {host.address}. {host.registration}.{' '}
            <a href={host.website}>pulseheberg.com</a>
          </p>
          <p>Images are served by Cloudinary (cloudinary.com).</p>
          <h2>Cookies and personal data</h2>
          <p>
            This site uses no analytics, no advertising and no tracking cookie. The only possible
            cookie, <code>NEXT_LOCALE</code>, remembers the language you picked for your visit.
          </p>
          <h2>Content</h2>
          <p>
            Texts and photos are by {name} unless stated otherwise. The site&apos;s source code is
            public: <a href={sourceCode}>github.com/Axel-Galand/axel.galand.eu</a>.
          </p>
        </>
      )}
    </PageShell>
  )
}
