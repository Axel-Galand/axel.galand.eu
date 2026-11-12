import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { PageHero } from '@/components/site/PageHero'
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

const card =
  'flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-7 text-ink-2 [&_a]:text-route [&_a]:underline [&_a]:underline-offset-[3px] [&_code]:rounded-md [&_code]:bg-inset [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[0.9em]'
const heading = 'font-mono text-[13px] font-normal text-muted'

const sourceCode = 'https://github.com/Axel-Galand/axel.galand.eu'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('legal')

  return pageMetadata({ locale, paths, title: t('title'), description: t('description') })
}

export default async function LegalNoticePage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('legal')
  const profile = await findPublicGlobal({ slug: 'profile', locale, depth: 0 })
  const name = profile.name || 'Axel Galand'
  const email = profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null

  return (
    <PageShell locale={locale} paths={paths}>
      <PageHero crumbs={[{ label: t('slug') }]} title={t('title')} />
      <div className="wrap grid grid-cols-1 gap-4 pt-2 pb-24 min-[980px]:grid-cols-2">
        {locale === 'fr' ? (
          <>
            <section className={card}>
              <h2 className={heading}>Éditeur</h2>
              <p>
                Ce site est édité par {name}, à titre personnel et non professionnel, qui en est
                aussi le directeur de la publication.{email ? <> Contact : {email}.</> : null}
              </p>
            </section>
            <section className={card}>
              <h2 className={heading}>Hébergement</h2>
              <p>
                {host.name}, {host.address}. {host.registration}.{' '}
                <a href={host.website}>pulseheberg.com</a>
              </p>
              <p>Les images sont servies par Cloudinary (cloudinary.com).</p>
            </section>
            <section className={card}>
              <h2 className={heading}>Cookies et données personnelles</h2>
              <p>
                Ce site n&apos;utilise ni mesure d&apos;audience, ni publicité, ni cookie de suivi.
                Le seul cookie possible, <code>NEXT_LOCALE</code>, retient la langue choisie le
                temps de la visite.
              </p>
            </section>
            <section className={card}>
              <h2 className={heading}>Contenus</h2>
              <p>
                Les textes et les photos sont de {name}, sauf mention contraire. Le code source du
                site est public : <a href={sourceCode}>github.com/Axel-Galand/axel.galand.eu</a>.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className={card}>
              <h2 className={heading}>Publisher</h2>
              <p>
                This site is published by {name}, as a private individual, who is also its editor.
                {email ? <> Contact: {email}.</> : null}
              </p>
            </section>
            <section className={card}>
              <h2 className={heading}>Hosting</h2>
              <p>
                {host.name}, {host.address}. {host.registration}.{' '}
                <a href={host.website}>pulseheberg.com</a>
              </p>
              <p>Images are served by Cloudinary (cloudinary.com).</p>
            </section>
            <section className={card}>
              <h2 className={heading}>Cookies and personal data</h2>
              <p>
                This site uses no analytics, no advertising and no tracking cookie. The only
                possible cookie, <code>NEXT_LOCALE</code>, remembers the language you picked for
                your visit.
              </p>
            </section>
            <section className={card}>
              <h2 className={heading}>Content</h2>
              <p>
                Texts and photos are by {name} unless stated otherwise. The site&apos;s source code
                is public: <a href={sourceCode}>github.com/Axel-Galand/axel.galand.eu</a>.
              </p>
            </section>
          </>
        )}
      </div>
    </PageShell>
  )
}
