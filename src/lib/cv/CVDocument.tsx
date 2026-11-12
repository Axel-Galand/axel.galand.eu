import path from 'path'

import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { Locale } from '@/i18n/locales'
import type { Experience, Profile, Skill } from '@/payload-types'

import { formatMonth, formatPeriod } from '../dates'

// The site's fonts, embedded (subset) in the PDF. The files sit in the repo, under the SIL Open Font
// License (see fonts/OFL-*.txt), and next.config.ts traces them into the standalone image.
const fonts = path.join(process.cwd(), 'src/lib/cv/fonts')

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(fonts, 'inter-latin-400-normal.woff'), fontWeight: 400 },
    { src: path.join(fonts, 'inter-latin-600-normal.woff'), fontWeight: 600 },
  ],
})
Font.register({
  family: 'Space Grotesk',
  fonts: [{ src: path.join(fonts, 'space-grotesk-latin-700-normal.woff'), fontWeight: 700 }],
})
// No hyphenation: names and technologies must stay whole.
Font.registerHyphenationCallback((word) => [word])

// The site's colors, light theme.
const ink = '#0e1116'
const muted = '#586174'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10, lineHeight: 1.4, color: ink },
  // A child inherits the page's line height in points (14), too tight for larger text.
  name: { fontSize: 22, lineHeight: 1.2, fontFamily: 'Space Grotesk', fontWeight: 700 },
  headline: { fontSize: 12, lineHeight: 1.3, marginTop: 4, color: muted },
  contact: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { marginTop: 16 },
  heading: {
    fontSize: 13,
    lineHeight: 1.3,
    fontFamily: 'Space Grotesk',
    fontWeight: 700,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dadee6',
  },
  item: { marginBottom: 8 },
  role: { fontWeight: 600 },
  muted: { color: muted },
  link: { color: '#0a5fb8', textDecoration: 'none' },
})

export type CVLabels = {
  jobs: string
  education: string
  skills: string
  languages: string
  certifications: string
  present: string
  categories: Record<Skill['category'], string>
}

type Props = {
  locale: Locale
  labels: CVLabels
  profile: Profile
  experiences: Experience[]
  skills: Skill[]
  categoryOrder: readonly Skill['category'][]
}

const ExperienceItem = ({
  experience,
  locale,
  present,
}: {
  experience: Experience
  locale: Locale
  present: string
}) => (
  <View style={styles.item} wrap={false}>
    <Text style={styles.role}>
      {experience.role} · {experience.organization}
    </Text>
    <Text style={styles.muted}>
      {formatPeriod(experience.start, experience.end, locale, present)}
      {experience.location ? ` · ${experience.location}` : ''}
    </Text>
    {experience.description ? <Text>{experience.description}</Text> : null}
    {(experience.highlights ?? [])
      .filter((highlight) => highlight.text)
      .map((highlight) => (
        <Text key={highlight.id ?? highlight.text}>• {highlight.text}</Text>
      ))}
  </View>
)

/** One sober column: name, contact links, then the same sections as the background page. */
export function CVDocument({ locale, labels, profile, experiences, skills, categoryOrder }: Props) {
  const timeline = (kind: Experience['kind']) =>
    experiences.filter((experience) => experience.kind === kind)

  return (
    <Document title={`${profile.name} · CV`} author={profile.name} language={locale}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.name}</Text>
        {profile.headline ? <Text style={styles.headline}>{profile.headline}</Text> : null}
        <View style={styles.contact}>
          {profile.email ? (
            <Link style={styles.link} src={`mailto:${profile.email}`}>
              {profile.email}
            </Link>
          ) : null}
          {(profile.links ?? []).map((link) => (
            <Link key={link.id ?? link.url} style={styles.link} src={link.url}>
              {link.url.replace(/^https?:\/\/(www\.)?/, '')}
            </Link>
          ))}
        </View>

        {(['job', 'education'] as const).map((kind) =>
          timeline(kind).length ? (
            <View key={kind} style={styles.section}>
              <Text style={styles.heading}>{kind === 'job' ? labels.jobs : labels.education}</Text>
              {timeline(kind).map((experience) => (
                <ExperienceItem
                  key={experience.id}
                  experience={experience}
                  locale={locale}
                  present={labels.present}
                />
              ))}
            </View>
          ) : null,
        )}

        {skills.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.skills}</Text>
            {categoryOrder.map((category) => {
              const names = skills
                .filter((skill) => skill.category === category)
                .map(({ name }) => name)

              return names.length ? (
                <Text key={category}>
                  <Text style={styles.role}>
                    {labels.categories[category]}
                    {locale === 'fr' ? ' : ' : ': '}
                  </Text>
                  {names.join(', ')}
                </Text>
              ) : null
            })}
          </View>
        ) : null}

        {profile.languages?.some((language) => language.language) ? (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.languages}</Text>
            {profile.languages
              .filter((language) => language.language)
              .map((language) => (
                <Text key={language.id ?? language.language}>
                  {language.language} · {language.level}
                </Text>
              ))}
          </View>
        ) : null}

        {profile.certifications?.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.certifications}</Text>
            {profile.certifications.map((certification) => (
              <Text key={certification.id ?? certification.name}>
                {certification.name}
                {certification.issuer ? ` · ${certification.issuer}` : ''}
                {certification.date ? ` · ${formatMonth(certification.date, locale)}` : ''}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
