import type { TocEntry } from '@/lib/headings'

type Props = { label: string; entries: TocEntry[]; className?: string }

/** The table of contents beside a long text. */
export function Toc({ label, entries, className = '' }: Props) {
  return (
    <nav aria-label={label} className={`font-mono text-sm ${className}`}>
      <p className="mb-3 text-[13px] text-muted">{label}</p>
      <ol className="flex flex-col">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="block border-l-2 border-line px-3.5 py-2.5 text-muted no-underline hover:border-code hover:text-ink"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
