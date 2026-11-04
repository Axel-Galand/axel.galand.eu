import type { Locale } from '@/i18n/locales'

// Payload stores dates at midnight UTC: format them in UTC, or they shift a day west of Greenwich.
// Drafts skip validation, so a date may be missing in preview: that formats as nothing.
const format = (
  value: string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) => {
  const date = value ? new Date(value) : undefined

  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date)
    : ''
}

export const formatDate = (value: string | null | undefined, locale: Locale): string =>
  format(value, locale, { dateStyle: 'long' })

export const formatMonth = (value: string | null | undefined, locale: Locale): string =>
  format(value, locale, { month: 'long', year: 'numeric' })

/** "mars 2021 – aujourd'hui" */
export const formatPeriod = (
  start: string | null | undefined,
  end: string | null | undefined,
  locale: Locale,
  present: string,
): string =>
  start ? `${formatMonth(start, locale)} – ${end ? formatMonth(end, locale) : present}` : ''
