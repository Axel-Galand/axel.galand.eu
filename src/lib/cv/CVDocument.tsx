import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { Locale } from '@/i18n/locales'
import type { Experience, Profile, Skill } from '@/payload-types'

import { formatMonth, formatPeriod } from '../dates'

// Helvetica is one of the PDF base fonts: nothing to embed, nothing to trace into the image.
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.4, color: '#1b1b1f' },
  // A child inherits the page's line height in points (14), too tight for larger text.
  name: { fontSize: 20, lineHeight: 1.2, fontFamily: 'Helvetica-Bold' },
  headline: { fontSize: 12, lineHeight: 1.3, marginTop: 4, color: '#5d5d66' },
  contact: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { marginTop: 16 },
  heading: {
    fontSize: 12,
    lineHeight: 1.3,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e6',
  },
  item: { marginBottom: 8 },
  role: { fontFamily: 'Helvetica-Bold' },
  muted: { color: '#5d5d66' },
  link: { color: '#5b3fd6', textDecoration: 'none' },
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
