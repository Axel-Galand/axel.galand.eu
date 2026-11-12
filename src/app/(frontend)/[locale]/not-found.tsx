import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { PageShell } from '@/components/site/PageShell'
import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/lib/paths'

const button =
  'inline-flex min-h-[50px] items-center rounded-full px-[22px] font-semibold no-underline'

export default async function NotFound() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notFound')

  const paths = { fr: localizedPath('/', 'fr'), en: localizedPath('/', 'en') }

  return (
    <PageShell locale={locale} paths={paths}>
      <section className="dots">
        <div className="wrap grid items-center gap-14 py-16 min-[980px]:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="self-start rounded-full bg-enduro/14 px-3 py-1 font-mono text-sm text-enduro">
              {t('badge')}
            </p>
            <h1 className="text-[clamp(3rem,6.4vw,6rem)] leading-[0.98] font-bold tracking-[-0.03em]">
              {t.rich('title', {
                trail: (chunks) => (
                  <span className="text-enduro underline decoration-dotted decoration-[6px] underline-offset-[12px]">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="max-w-[30em] text-[clamp(1.125rem,1.4vw,1.25rem)] text-ink-2">
              {t('body')}
            </p>
            <div
              aria-hidden="true"
              className="max-w-[440px] overflow-hidden rounded-xl border border-line bg-surface font-mono text-sm leading-[1.7]"
            >
              <p className="border-b border-line bg-bar px-4 py-2 text-[13px] text-muted">
                terminal
              </p>
              <div className="flex flex-col px-4 py-3.5">
                <span>
                  <span className="text-code">$</span> cd /{t('path')}
                </span>
                <span className="text-rose">cd: no such file or directory</span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-code">$</span>
                  <span className="inline-block h-[18px] w-[9px] animate-blink bg-code" />
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={localizedPath('/', locale)}
                className={`${button} bg-btn text-btn-ink hover:text-btn-ink`}
              >
                {t('back')}
              </Link>
              <Link
                href={localizedPath('/projets', locale)}
                className={`${button} border border-line-strong`}
              >
                {t('projects')}
              </Link>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-line bg-topo"
          >
            <svg viewBox="0 0 560 460" width="100%" fill="none" className="block text-enduro">
              <g stroke="currentColor" strokeWidth="1.5" opacity="0.45">
                <ellipse cx="250" cy="240" rx="50" ry="28" transform="rotate(-14 250 240)" />
                <ellipse cx="250" cy="240" rx="104" ry="60" transform="rotate(-14 250 240)" />
                <ellipse cx="246" cy="242" rx="162" ry="96" transform="rotate(-12 246 242)" />
                <ellipse cx="240" cy="244" rx="226" ry="138" transform="rotate(-10 240 244)" />
                <ellipse cx="232" cy="246" rx="296" ry="186" transform="rotate(-8 232 246)" />
                <ellipse cx="470" cy="80" rx="40" ry="22" transform="rotate(20 470 80)" />
                <ellipse cx="470" cy="80" rx="86" ry="48" transform="rotate(20 470 80)" />
              </g>
              <path
                d="M30 420C120 380 150 300 230 290S330 220 340 170"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
              <path
                d="M340 170C344 150 372 128 410 150S440 210 470 226"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
                className="stroke-rose"
              />
              <circle cx="30" cy="420" r="7" fill="currentColor" />
              <path
                d="M458 214l24 24M482 214l-24 24"
                strokeWidth="4"
                strokeLinecap="round"
                className="stroke-rose"
              />
              <path
                d="M340 170C352 120 380 70 420 44"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="420" cy="44" r="7" stroke="currentColor" strokeWidth="3" opacity="0.4" />
            </svg>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
