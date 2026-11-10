/**
 * The five accent colors, as full class names so Tailwind finds them. Cards cycle through them in
 * their order on the page; the three first also stand for code, road and enduro.
 */
export const accents = {
  code: {
    text: 'text-code',
    soft: 'bg-code/14 text-code',
    dot: 'bg-code',
  },
  route: {
    text: 'text-route',
    soft: 'bg-route/14 text-route',
    dot: 'bg-route',
  },
  violet: {
    text: 'text-violet',
    soft: 'bg-violet/14 text-violet',
    dot: 'bg-violet',
  },
  enduro: {
    text: 'text-enduro',
    soft: 'bg-enduro/14 text-enduro',
    dot: 'bg-enduro',
  },
  rose: {
    text: 'text-rose',
    soft: 'bg-rose/14 text-rose',
    dot: 'bg-rose',
  },
} as const

export type Accent = keyof typeof accents

const cycle: Accent[] = ['code', 'route', 'violet', 'enduro', 'rose']

export const accentAt = (index: number): Accent => cycle[index % cycle.length]
