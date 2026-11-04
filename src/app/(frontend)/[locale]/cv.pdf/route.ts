import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { getTranslations } from 'next-intl/server'
import { createElement, type ReactElement } from 'react'

import { skillCategories } from '@/collections/Skills'
import { isLocale } from '@/i18n/locales'
import { findPublic, findPublicGlobal, type Reader } from '@/lib/content'
import { CVDocument, type CVLabels } from '@/lib/cv/CVDocument'

// Built on each request from the published content: no cache to keep in sync.
export const dynamic = 'force-dynamic'

// The public CV only ever shows published content.
const visitor: Reader = { draft: false }

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return new Response('Not Found', { status: 404 })
  }

  const [t, tBackground, profile, { docs: experiences }, { docs: skills }] = await Promise.all([
    getTranslations({ locale, namespace: 'cv' }),
    getTranslations({ locale, namespace: 'background' }),
    findPublicGlobal({ slug: 'profile', locale, depth: 0, reader: visitor }),
    findPublic({
      collection: 'experiences',
      locale,
      sort: ['-start', 'order'],
      limit: 100,
      depth: 0,
      reader: visitor,
    }),
    findPublic({
      collection: 'skills',
      locale,
      sort: 'order',
      limit: 300,
      depth: 0,
      reader: visitor,
    }),
  ])

  // No published profile, or not translated into this language (its headline is required).
  if (!profile.name || !profile.headline) {
    return new Response('Not Found', { status: 404 })
  }

  const categoryOrder = skillCategories.map(({ value }) => value)
  const labels: CVLabels = {
    jobs: t('jobs'),
    education: t('education'),
    skills: t('skills'),
    languages: t('languages'),
    certifications: t('certifications'),
    present: t('present'),
    categories: Object.fromEntries(
      categoryOrder.map((category) => [category, tBackground(`categories.${category}`)]),
    ) as CVLabels['categories'],
  }

  const pdf = await renderToBuffer(
    createElement(CVDocument, {
      locale,
      labels,
      profile,
      experiences,
      skills,
      categoryOrder,
    }) as unknown as ReactElement<DocumentProps>,
  )

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="axel-galand-cv-${locale}.pdf"`,
    },
  })
}
