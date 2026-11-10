import Link from 'next/link'

import { type Accent, accents } from './accents'

type Props = {
  accent: Accent
  children: React.ReactNode
  /** The "all items" link at the right of the title. */
  more?: { href: string; label: string }
  id?: string
}

/** A section title with its colored square, and an optional link to the full list. */
export function SectionTitle({ accent, children, more, id }: Props) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 id={id} className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-tight">
        <span
          aria-hidden="true"
          className={`mr-3.5 inline-block size-3.5 rounded ${accents[accent].dot}`}
        />
        {children}
      </h2>
      {more ? (
        <Link href={more.href} className="py-3 font-mono text-sm">
          {more.label} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  )
}
