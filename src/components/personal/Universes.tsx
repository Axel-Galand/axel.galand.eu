import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { Road, Topo } from '@/components/visuals/illustrations'

type Props = {
  /** Where each card leads; its anchor is the universe (#road, #enduro). */
  href: string
  heading?: 'h2' | 'h3'
}

const universes = [
  { key: 'road', Art: Road, ground: 'bg-road', color: 'text-route' },
  { key: 'enduro', Art: Topo, ground: 'bg-topo', color: 'text-enduro' },
] as const

/** The two sides of off screen: the road and the trails. */
export async function Universes({ href, heading: Heading = 'h3' }: Props) {
  const t = await getTranslations('home')

  return universes.map(({ key, Art, ground, color }) => (
    <Link
      key={key}
      href={`${href}#${key}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface no-underline transition-[border-color,translate] duration-200 hover:-translate-y-[3px] hover:border-faint min-[980px]:col-span-6"
    >
      <span className={`relative block h-[220px] ${ground}`}>
        <Art className="absolute inset-0 size-full" />
      </span>
      <div className="flex flex-col gap-2 px-7 pt-6 pb-7">
        <Heading className={`text-[34px] leading-[1.05] font-bold tracking-tight ${color}`}>
          {t(key === 'road' ? 'roadTitle' : 'enduroTitle')}
        </Heading>
        <span className="text-ink-2">{t(key === 'road' ? 'roadBody' : 'enduroBody')}</span>
      </div>
    </Link>
  ))
}
