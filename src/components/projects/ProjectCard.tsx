import Link from 'next/link'

import { Picture } from '@/components/Picture'
import { type Accent, accents } from '@/components/site/accents'
import { Booking, Publishing, Topo, Trading, WebVitals } from '@/components/visuals/illustrations'
import type { CaseStudy } from '@/payload-types'

export type ProjectCardLabels = {
  testing: string
  personal: string
  webVitals: string
  draft: string
  preview: string
  published: string
}

type Props = {
  study: CaseStudy
  href: string
  number: number
  accent: Accent
  /** `wide` cards put the Core Web Vitals panel beside the text. */
  wide: boolean
  labels: ProjectCardLabels
  className?: string
}

const stackNames = (study: CaseStudy): string[] =>
  (study.stack ?? []).flatMap((skill) => (typeof skill === 'object' ? [skill.name] : []))

/** A project as a card: number, stack, title, summary, and its visual (illustration or cover). */
export function ProjectCard({ study, href, number, accent, wide, labels, className = '' }: Props) {
  const colors = accents[accent]
  const visual = study.visual ?? 'cover'
  const side = visual === 'booking' || (visual === 'web-vitals' && wide)

  const tags = (
    <span className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
      <span className={`mr-2 ${colors.text}`}>{String(number).padStart(2, '0')}</span>
      {stackNames(study)
        .slice(0, 3)
        .map((name) => (
          <span key={name} className={`rounded-full px-2.5 py-0.5 ${colors.soft}`}>
            {name}
          </span>
        ))}
      {study.kind === 'personal' ? (
        <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-muted">
          {labels.personal}
        </span>
      ) : null}
      {study.status === 'testing' ? (
        <span className="rounded-full border border-dashed border-enduro px-2.5 py-0.5 text-enduro">
          {labels.testing}
        </span>
      ) : null}
    </span>
  )

  const text = (
    <div className={`flex flex-col gap-[18px] ${visual === 'booking' ? 'pb-7' : ''}`}>
      {tags}
      <h3 className="font-display text-[clamp(1.5rem,2.2vw,1.875rem)] leading-[1.12] font-semibold">
        {study.title}
      </h3>
      <span className="text-ink-2">{study.summary}</span>
    </div>
  )

  const art =
    visual === 'web-vitals' ? (
      <WebVitals label={labels.webVitals} />
    ) : visual === 'booking' ? (
      <Booking />
    ) : visual === 'trading' ? (
      <Trading />
    ) : visual === 'publishing' ? (
      <Publishing labels={labels} />
    ) : visual === 'topo' ? (
      <span className="mt-auto block overflow-hidden rounded-xl border border-line bg-topo">
        <Topo className="block h-32 w-full" />
      </span>
    ) : visual === 'cover' && study.cover ? (
      <span className="mt-auto block overflow-hidden rounded-xl border border-line bg-inset">
        <Picture
          media={study.cover}
          sizes="(min-width: 980px) 40vw, 100vw"
          className="aspect-[16/9] w-full object-cover"
        />
      </span>
    ) : null

  const layout = side
    ? visual === 'booking'
      ? 'flex flex-col justify-between gap-6 pb-0 overflow-hidden min-[640px]:flex-row'
      : 'grid items-center gap-7 min-[980px]:grid-cols-[minmax(0,1fr)_250px]'
    : 'flex flex-col gap-[18px]'

  return (
    <Link
      href={href}
      className={`${layout} rounded-2xl border border-line bg-surface p-7 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint motion-reduce:hover:translate-y-0 ${className}`}
    >
      {text}
      {art}
    </Link>
  )
}
