import type { Experience } from '@/payload-types'

type Props = {
  experiences: Experience[]
  labels: { present: string; head: string }
  /** Shows each entry's description, cut to two lines (the home page). */
  descriptions?: boolean
  /** Full entries (the background page): heading level, location, and what goes below. */
  details?: (experience: Experience) => React.ReactNode
}

const year = (date: string | null | undefined) => (date ? new Date(date).getUTCFullYear() : null)

const span = (experience: Experience, present: string) => {
  const start = year(experience.start)

  // A draft may have no start date yet (preview only).
  if (!start) return ''
  const end = experience.end ? year(experience.end) : null

  if (!experience.end) return `${start} → ${present}`
  return start === end ? `${start}` : `${start} → ${end}`
}

/** Jobs and education as a `git log --graph`: newest on top, the current job at HEAD. */
export function GitLog({ experiences, labels, descriptions = false, details }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <p
        aria-hidden="true"
        className="border-b border-line bg-bar px-5 py-3 font-mono text-[13px] text-muted"
      >
        <span className="text-code">$</span> git log --graph
      </p>
      <ol className="py-2">
        {experiences.map((experience, index) => {
          const current = experience.kind === 'job' && !experience.end
          // Only the newest ongoing job is HEAD.
          const head =
            current &&
            experiences.findIndex((other) => other.kind === 'job' && !other.end) === index
          const node = current
            ? 'bg-code'
            : experience.kind === 'education'
              ? 'bg-violet'
              : 'bg-route'

          return (
            <li
              key={experience.id}
              className={`relative py-[18px] pr-5 pl-14 before:absolute before:left-[23px] before:w-0.5 before:bg-line-strong ${
                index === 0 ? 'before:top-7' : 'before:top-0'
              } ${index === experiences.length - 1 ? 'before:h-7' : 'before:bottom-0'}`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-[22px] left-4 size-4 rounded-full border-[3px] border-surface ${node}`}
              />
              <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
                <span className="w-[104px] shrink-0 font-mono text-[13px] text-muted">
                  {span(experience, labels.present)}
                </span>
                {details ? (
                  <h3 className="text-2xl font-semibold">
                    {experience.role} · {experience.organization}
                  </h3>
                ) : (
                  <span className="font-display text-xl font-semibold">
                    {experience.role} · {experience.organization}
                  </span>
                )}
                {head ? (
                  <span className="rounded-md bg-code-fill px-2 py-0.5 font-mono text-xs text-on-fill">
                    {labels.head}
                  </span>
                ) : null}
                {details && experience.location ? (
                  <span className="font-mono text-[13px] text-muted">{experience.location}</span>
                ) : null}
              </div>
              {details ? (
                <div className="mt-2 flex flex-col gap-3.5 min-[640px]:pl-[118px]">
                  {details(experience)}
                </div>
              ) : null}
              {descriptions && experience.description ? (
                <span className="mt-1 line-clamp-2 block text-[15px] text-muted min-[640px]:pl-[118px]">
                  {experience.description}
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
