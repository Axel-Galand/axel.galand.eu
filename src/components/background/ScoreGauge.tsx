type Props = { score: number; max: number; label: string }

// The arc is about 336 units long; the gauge fills its share of it.
const arc = 'M37.25 146A84 84 0 1 1 182.75 146'

/** A rev-counter style gauge for a test score (TOEIC). */
export function ScoreGauge({ score, max, label }: Props) {
  const share = Math.min(1, Math.max(0, score / max))

  return (
    <div className="grid w-[220px] max-w-full shrink-0 place-items-center">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 220 160"
        width="220"
        height="160"
        fill="none"
        className="max-w-full [grid-area:1/1]"
      >
        <path d={arc} strokeWidth="14" strokeLinecap="round" className="stroke-line" />
        <path
          d={arc}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${Math.round(336 * share)} 400`}
          className="stroke-route"
        />
        <path
          d="M51.11 138A68 68 0 1 1 168.89 138"
          strokeWidth="6"
          strokeDasharray="2 13.8"
          className="stroke-ghost"
        />
      </svg>
      <span aria-hidden="true" className="flex flex-col items-center pt-[34px] [grid-area:1/1]">
        <span className="font-display text-[52px] leading-none font-bold tracking-tight">
          {score}
        </span>
        <span className="font-mono text-[13px] text-muted">/ {max}</span>
      </span>
    </div>
  )
}
