import Link from 'next/link'

import { Picture } from '@/components/Picture'
import type { Album } from '@/payload-types'

type Props = {
  album: Album
  href: string
  /** "enduro · Saison 2026 · 12 photos" */
  meta: string
  heading?: 'h2' | 'h3'
}

export function AlbumCard({ album, href, meta, heading: Heading = 'h3' }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint"
    >
      {/* The ratio box keeps its room even without a cover (a draft, in preview). */}
      <span className="block aspect-[3/2] overflow-hidden bg-inset">
        <Picture
          media={album.cover}
          sizes="(min-width: 980px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
      </span>
      <div className="flex flex-col gap-1.5 px-6 pt-5 pb-6">
        <Heading className="text-[22px] leading-[1.2] font-semibold">{album.title}</Heading>
        <span className="font-mono text-[13px] text-muted">{meta}</span>
      </div>
    </Link>
  )
}
