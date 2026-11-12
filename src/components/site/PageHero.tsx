import Link from 'next/link'

type Crumb = { label: string; href?: string }

type Props = {
  /** The path shown above the title, like a shell prompt: ~/projets/slug. */
  crumbs: Crumb[]
  title: string
  lead?: React.ReactNode
  /** Tags above the title. */
  tags?: React.ReactNode
  children?: React.ReactNode
  /** Smaller title, for long document titles. */
  long?: boolean
}

/** The top block of every page but the home: path, title, lead, on the dotted ground. */
export function PageHero({ crumbs, title, lead, tags, children, long = false }: Props) {
  return (
    <section className="dots">
      <div className="wrap flex flex-col gap-5 pt-[clamp(2.5rem,5vw,4.5rem)] pb-[clamp(2.5rem,5vw,4rem)]">
        <p className="font-mono text-sm text-muted">
          <span className="text-code">~</span>
          {crumbs.map((crumb, index) => (
            <span key={index}>
              /
              {crumb.href ? (
                <Link href={crumb.href} className="text-muted">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </span>
          ))}
        </p>
        {tags}
        <h1
          className={
            long
              ? 'max-w-[17em] text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.05] font-bold tracking-[-0.03em]'
              : 'text-[clamp(2.75rem,6vw,5.25rem)] leading-none font-bold tracking-[-0.03em]'
          }
        >
          {title}
        </h1>
        {lead ? (
          <div className="max-w-[40em] text-[clamp(1.125rem,1.4vw,1.25rem)] text-ink-2">{lead}</div>
        ) : null}
        {children}
      </div>
    </section>
  )
}
