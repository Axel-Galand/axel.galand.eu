/*
 * The drawn illustrations of the design. All are decorative (aria-hidden): the text next to them
 * says what they stand for. Colors come from the theme tokens, so they follow the theme.
 */

const bar = (marker: string) => (
  <span className="relative h-2 rounded bg-[linear-gradient(90deg,var(--code)_0_55%,var(--color-warn)_55%_80%,var(--color-bad)_80%_100%)]">
    <span className="absolute -top-[5px] h-[18px] w-1 rounded-sm bg-ink" style={{ left: marker }} />
  </span>
)

/** Three Core Web Vitals bars, markers in the green. No values: the bars are decoration. */
export function WebVitals({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-xl border border-line bg-inset p-5 font-mono text-xs"
    >
      <span className="text-muted">{label}</span>
      {[
        ['LCP', '24%'],
        ['INP', '36%'],
        ['CLS', '12%'],
      ].map(([name, marker]) => (
        <span key={name} className="grid grid-cols-[34px_1fr] items-center gap-2.5">
          {name}
          {bar(marker)}
        </span>
      ))}
    </span>
  )
}

/** A phone peeking from the bottom of the card, with a booking calendar. */
export function Booking() {
  const days = Array.from({ length: 21 }, (_, day) => day >= 9 && day <= 12)

  return (
    <span
      aria-hidden="true"
      className="flex h-[236px] w-32 shrink-0 flex-col gap-3 self-center rounded-t-3xl min-[640px]:self-end border-2 border-b-0 border-line-strong bg-inset px-3 pt-3.5"
    >
      <span className="h-[5px] w-9 self-center rounded-full bg-line-strong" />
      <span className="h-2 w-3/5 rounded bg-line-strong" />
      <span className="grid grid-cols-7 gap-[5px]">
        {days.map((booked, day) => (
          <span
            key={day}
            className={`aspect-square rounded-full ${booked ? 'bg-route' : 'bg-line'}`}
          />
        ))}
      </span>
      <span className="h-11 rounded-[10px] border border-route bg-route/14" />
      <span className="h-7 rounded-full bg-route" />
    </span>
  )
}

const candles = {
  up: [
    [12, 70, 104, 78, 18],
    [48, 60, 96, 66, 22],
    [66, 52, 84, 58, 16],
    [102, 48, 86, 54, 24],
    [120, 40, 72, 46, 16],
    [156, 34, 70, 40, 22],
    [174, 26, 58, 32, 18],
    [210, 20, 54, 26, 20],
    [228, 14, 44, 20, 18],
  ],
  down: [
    [30, 74, 100, 80, 12],
    [84, 56, 90, 62, 20],
    [138, 44, 78, 50, 18],
    [192, 30, 62, 36, 16],
  ],
}

/** A rising candlestick chart with a live price line. */
export function Trading() {
  const draw = (rows: number[][]) =>
    rows.map(([x, high, low, top, height]) => (
      <g key={x}>
        <path d={`M${x} ${high}v${low - high}`} />
        <rect x={x - 5} y={top} width="10" height={height} rx="1.5" />
      </g>
    ))

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 112"
      className="mt-auto block w-full rounded-xl border border-line bg-inset"
    >
      <g className="text-code" stroke="currentColor" fill="currentColor" strokeWidth="1.5">
        {draw(candles.up)}
      </g>
      <g className="text-rose" stroke="currentColor" fill="currentColor" strokeWidth="1.5">
        {draw(candles.down)}
      </g>
      <g className="text-code">
        <path d="M0 20h260" stroke="currentColor" strokeDasharray="3 5" opacity="0.6" />
        <circle className="animate-blink" cx="247" cy="20" r="4" fill="currentColor" />
      </g>
    </svg>
  )
}

/** How this site's content gets written: Claude, MCP, draft, preview, published. */
export function Publishing({
  labels,
}: {
  labels: { draft: string; preview: string; published: string }
}) {
  const step = 'rounded-lg px-3 py-[7px]'

  return (
    <span
      aria-hidden="true"
      className="mt-auto flex flex-wrap items-center gap-2 rounded-xl border border-line bg-inset p-[18px] font-mono text-[13px] text-faint"
    >
      <span className={`${step} bg-violet/14 text-violet`}>Claude</span>→
      <span className={`${step} border border-line-strong text-ink`}>MCP</span>→
      <span className={`${step} border border-dashed border-enduro text-enduro`}>
        {labels.draft}
      </span>
      →<span className={`${step} border border-line-strong text-ink`}>{labels.preview}</span>→
      <span className={`${step} bg-code-fill text-on-fill`}>{labels.published}</span>
    </span>
  )
}

/** Contour lines and a dotted special-stage trace, start to finish. */
export function Topo({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 580 260"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={`text-enduro ${className}`}
    >
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.45">
        <ellipse cx="330" cy="140" rx="46" ry="24" transform="rotate(-14 330 140)" />
        <ellipse cx="330" cy="140" rx="96" ry="52" transform="rotate(-14 330 140)" />
        <ellipse cx="326" cy="142" rx="150" ry="84" transform="rotate(-12 326 142)" />
        <ellipse cx="320" cy="144" rx="210" ry="120" transform="rotate(-10 320 144)" />
        <ellipse cx="312" cy="146" rx="276" ry="160" transform="rotate(-8 312 146)" />
        <ellipse cx="96" cy="52" rx="34" ry="18" transform="rotate(18 96 52)" />
        <ellipse cx="96" cy="52" rx="74" ry="40" transform="rotate(18 96 52)" />
      </g>
      <path
        d="M30 220C110 190 150 240 220 180S300 90 330 140 430 210 550 60"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <circle cx="30" cy="220" r="6" fill="currentColor" />
      <circle cx="550" cy="60" r="6" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

/** A winding road with its centre line running. */
export function Road({ className = '' }: { className?: string }) {
  const path = 'M-40 230C140 230 170 70 300 70S450 190 620 40'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 580 260"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={`text-route ${className}`}
    >
      <path d={path} strokeWidth="84" strokeLinecap="round" className="stroke-asphalt" />
      <path
        d={path}
        // Runs while the card is hovered or focused only: nothing moves on its own for long.
        className="animate-road [animation-play-state:paused] group-hover:[animation-play-state:running] group-focus-visible:[animation-play-state:running]"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="24 16"
      />
    </svg>
  )
}

/** A strip of tyre tread, fading at both ends: the divider between sections. */
export function Tread() {
  return (
    <div aria-hidden="true" className="wrap pb-14">
      <svg
        width="100%"
        height="34"
        className="block text-tread [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]"
      >
        <defs>
          <pattern
            id="tread"
            width="46"
            height="34"
            patternUnits="userSpaceOnUse"
            patternTransform="skewX(-14)"
          >
            <rect x="2" y="1" width="17" height="8" rx="2" fill="currentColor" />
            <rect x="25" y="1" width="17" height="8" rx="2" fill="currentColor" />
            <rect x="13" y="13" width="20" height="8" rx="2" fill="currentColor" />
            <rect x="2" y="25" width="17" height="8" rx="2" fill="currentColor" />
            <rect x="25" y="25" width="17" height="8" rx="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="34" fill="url(#tread)" />
      </svg>
    </div>
  )
}
