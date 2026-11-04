/**
 * Fictional data for local development and manual testing: `pnpm seed`. Never real content (this
 * repository is public) and never run against production.
 */
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config'
import { richTextFromMarkdown } from '../mcp/writeRichText'

const SEED = 'exemple'

const md = (payload: Payload, collection: 'case-studies' | 'notes', field: string, text: string) =>
  richTextFromMarkdown(payload.collections[collection].config.flattenedFields, field, text)

const image = async (payload: Payload, name: string, color: string, alt: string) => {
  const data = await sharp({
    create: { width: 1600, height: 1000, channels: 3, background: color },
  })
    .jpeg()
    .toBuffer()

  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: `${SEED}-${name}.jpg`, size: data.length },
  })
}

const clear = async (payload: Payload) => {
  const bySlug = { slug: { like: SEED } }

  await payload.delete({ collection: 'case-studies', where: bySlug })
  await payload.delete({ collection: 'notes', where: bySlug })
  await payload.delete({ collection: 'albums', where: bySlug })
  await payload.delete({ collection: 'experiences', where: { organization: { like: 'Exemple' } } })
  await payload.delete({ collection: 'skills', where: { name: { like: '(exemple)' } } })
  await payload.delete({ collection: 'media', where: { filename: { like: `${SEED}-` } } })
}

const seed = async () => {
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('/data/')) {
    throw new Error('The seed only runs against a local development database.')
  }

  const payload = await getPayload({ config })
  await clear(payload)

  const published = { _status: 'published' as const }

  const skills = await Promise.all(
    (
      [
        ['Next.js', 'front'],
        ['TypeScript', 'front'],
        ['NestJS', 'back'],
        ['Payload', 'cms'],
        ['PostgreSQL', 'data'],
        ['Docker', 'infra'],
        ['Playwright', 'quality'],
      ] as const
    ).map(([name, category], order) =>
      payload.create({
        collection: 'skills',
        data: { name: `${name} (exemple)`, category, order, ...published },
      }),
    ),
  )

  const [cover, diagram, ...photos] = await Promise.all([
    image(payload, 'cover', '#3b5bdb', 'Couverture d’exemple'),
    image(payload, 'diagram', '#2b8a3e', 'Schéma d’exemple'),
    image(payload, 'ride-1', '#e8590c', 'Photo d’exemple 1'),
    image(payload, 'ride-2', '#c2255c', 'Photo d’exemple 2'),
    image(payload, 'ride-3', '#5f3dc4', 'Photo d’exemple 3'),
  ])

  const story = (subject: string) => ({
    context: md(payload, 'case-studies', 'context', `Une plateforme d’exemple pour ${subject}.`),
    challenge: md(
      payload,
      'case-studies',
      'challenge',
      'Le défi : **tenir la charge** sans exploser les coûts.',
    ),
    work: md(
      payload,
      'case-studies',
      'work',
      '- Cache par tags\n- Purge ciblée\n- Tests de charge',
    ),
    result: md(payload, 'case-studies', 'result', 'Des pages servies en moins de 200 ms.'),
    learnings: md(payload, 'case-studies', 'learnings', 'Mesurer avant d’optimiser.'),
  })

  const live = await payload.create({
    collection: 'case-studies',
    data: {
      ...published,
      title: 'Plateforme de réservation (exemple)',
      slug: `${SEED}-reservation`,
      summary: 'Une étude de cas fictive pour développer le site.',
      sector: 'Location (exemple)',
      role: 'Développeur full-stack',
      period: { start: '2023-12-01T00:00:00.000Z', end: '2026-07-01T00:00:00.000Z' },
      stack: skills.slice(0, 4).map((skill) => skill.id),
      metrics: [
        { value: '5', label: 'pays' },
        { value: '9', label: 'langues' },
      ],
      cover: cover.id,
      diagram: diagram.id,
      featured: true,
      ...story('la réservation en ligne'),
    },
    locale: 'fr',
  })

  await payload.update({
    collection: 'case-studies',
    id: live.id,
    locale: 'en',
    data: {
      ...published,
      title: 'Booking platform (example)',
      summary: 'A fictional case study for developing the site.',
      sector: 'Rental (example)',
      role: 'Full-stack developer',
      // Publishing a locale validates its required fields, array rows included.
      metrics: (live.metrics ?? []).map((metric, index) => ({
        ...metric,
        label: ['countries', 'languages'][index] ?? metric.label,
      })),
    },
  })

  await payload.create({
    collection: 'case-studies',
    draft: true,
    data: {
      title: 'Étude de cas en brouillon (exemple)',
      slug: `${SEED}-brouillon`,
      summary: 'Jamais visible sur le site public.',
      sector: 'Secteur (exemple)',
      period: { start: '2025-01-01T00:00:00.000Z' },
      ...story('un projet en cours'),
    },
  })

  await payload.create({
    collection: 'notes',
    data: {
      ...published,
      title: 'Docker contourne ufw (exemple)',
      slug: `${SEED}-docker-ufw`,
      excerpt: 'Une note fictive avec un bloc de code.',
      publishedAt: new Date().toISOString(),
      tags: ['docker', 'sécurité'],
      body: md(
        payload,
        'notes',
        'body',
        '## Le problème\n\nLes ports publiés par Docker passent devant ufw.\n\n```bash\nsudo ufw reload\n```\n',
      ),
    },
  })

  await payload.create({
    collection: 'albums',
    data: {
      ...published,
      title: 'Saison d’enduro (exemple)',
      slug: `${SEED}-enduro`,
      season: 2026,
      description: 'Un album fictif.',
      cover: photos[0]!.id,
      photos: photos.map((photo) => photo.id),
    },
  })

  await payload.create({
    collection: 'experiences',
    data: {
      ...published,
      kind: 'job',
      organization: 'Exemple Agence',
      role: 'Développeur full-stack',
      start: '2021-11-01T00:00:00.000Z',
      highlights: [{ text: 'Livré des plateformes multi-pays' }],
      caseStudies: [live.id],
    },
  })

  await payload.create({
    collection: 'experiences',
    data: {
      ...published,
      kind: 'education',
      organization: 'Exemple École',
      role: 'Diplôme d’ingénieur',
      start: '2018-09-01T00:00:00.000Z',
      end: '2023-09-01T00:00:00.000Z',
    },
  })

  await payload.updateGlobal({
    slug: 'profile',
    data: {
      ...published,
      name: 'Prénom Nom (exemple)',
      headline: 'Développeur full-stack (exemple)',
      location: 'Ville',
      links: [{ kind: 'github', url: 'https://github.com/example' }],
      languages: [{ language: 'Français', level: 'Langue maternelle' }],
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      ...published,
      defaultTitle: 'Portfolio (exemple)',
      defaultDescription: 'Site de développement.',
      defaultOgImage: cover.id,
    },
  })

  payload.logger.info('Seed done: fictional content in the local database.')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
