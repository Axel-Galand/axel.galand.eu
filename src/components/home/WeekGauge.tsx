type Props = {
  title: string
  value: string
  unit: string
  label: string
  legend: { code: string; road: string; enduro: string }
}

// The arc is 336 units long: five sevenths of code, then a sliver each for road and enduro.
const arc = 'M37.25 146A84 84 0 1 1 182.75 146'

/** A rev-counter style gauge of a typical week: five days of code, two on a motorcycle. */
export function WeekGauge({ title, value, unit, label, legend }: Props) {
  return (
    <div className="flex min-h-[270px] flex-col gap-2 rounded-2xl border border-line bg-surface p-6">
      <span className="font-mono text-[13px] text-muted">{title}</span>
      <div className="grid flex-1 place-items-center">
        <svg
          role="img"
          aria-label={label}
          viewBox="0 0 220 160"
          width="220"
          height="160"
          fill="none"
          className="[grid-area:1/1] max-w-full"
        >
          <path d={arc} strokeWidth="14" strokeLinecap="round" className="stroke-line" />
          <path d={arc} strokeWidth="14" strokeDasharray="236 400" className="stroke-code" />
          <path
            d={arc}
            strokeWidth="14"
            strokeDasharray="44 400"
            strokeDashoffset="-242"
            className="stroke-route"
          />
          <path
            d={arc}
            strokeWidth="14"
            strokeDasharray="44 400"
            strokeDashoffset="-292"
            className="stroke-enduro"
          />
          <path
            d="M51.11 138A68 68 0 1 1 168.89 138"
            strokeWidth="6"
            strokeDasharray="2 13.8"
            className="stroke-ghost"
          />
        </svg>
        <span aria-hidden="true" className="flex flex-col items-center pt-[34px] [grid-area:1/1]">
          <span className="font-display text-[46px] leading-none font-bold tracking-tight">
            {value}
          </span>
          <span className="font-mono text-[13px] text-muted">{unit}</span>
        </span>
      </div>
      <span className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[13px] text-ink-2">
        {(
          [
            ['bg-code', legend.code],
            ['bg-route', legend.road],
            ['bg-enduro', legend.enduro],
          ] as const
        ).map(([dot, name]) => (
          <span key={name} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
            {name}
          </span>
        ))}
      </span>
    </div>
  )
}
