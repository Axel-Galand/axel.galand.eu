type Props = {
  file: string
  role?: string | null
  base?: string | null
  stack: string[]
  since?: number | null
}

const quoted = (value: string) => <span className="text-code">{`'${value}'`}</span>
const punct = (value: string) => <span className="text-faint">{value}</span>

/** The hero's code window: who I am, as a TypeScript object. Decorative, the text says it too. */
export function EditorWindow({ file, role, base, stack, since }: Props) {
  const lines: React.ReactNode[] = [
    <>
      <span className="text-violet">const</span> {file.replace(/\.ts$/, '')} {punct('= {')}
    </>,
  ]
  const field = (name: string, value: React.ReactNode) =>
    lines.push(
      <span className="pl-[2ch]">
        <span className="text-route">{name}</span>
        {punct(': ')}
        {value}
        {punct(',')}
      </span>,
    )

  if (role) field('role', quoted(role))
  if (base) field('base', quoted(base))
  if (stack.length)
    field(
      'stack',
      <>
        {punct('[')}
        {stack.map((name, index) => (
          <span key={index}>
            {index ? punct(', ') : null}
            {quoted(name)}
          </span>
        ))}
        {punct(']')}
      </>,
    )
  if (since) field('since', <span className="text-rose">{since}</span>)
  field(
    'garage',
    <>
      {punct('[')}
      <span className="text-route">{"'road'"}</span>
      {punct(', ')}
      <span className="text-enduro">{"'enduro'"}</span>
      {punct(']')}
    </>,
  )
  lines.push(
    <span className="inline-flex items-center gap-1">
      {punct('}')}
      <span className="inline-block h-[19px] w-[9px] animate-blink bg-code" />
    </span>,
  )

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[14px_14px_0_color-mix(in_srgb,var(--code)_14%,transparent)]"
    >
      <div className="flex items-stretch gap-4 border-b border-line bg-bar px-4">
        <span className="inline-flex items-center gap-[7px] py-3.5">
          <span className="size-[11px] rounded-full bg-rose" />
          <span className="size-[11px] rounded-full bg-enduro" />
          <span className="size-[11px] rounded-full bg-code" />
        </span>
        <span className="inline-flex items-center border-t-2 border-code bg-surface px-3.5 font-mono text-[13px]">
          {file}
        </span>
        <span className="inline-flex items-center font-mono text-[13px] text-faint">garage.md</span>
      </div>
      <div className="flex flex-col gap-1 overflow-x-auto px-5 py-6 font-mono text-[15px] leading-[1.7] whitespace-nowrap">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-5">
            <span className="text-ghost">{index + 1}</span>
            {line}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-x-5 gap-y-1.5 border-t border-line bg-bar px-4 py-2 font-mono text-xs text-faint">
        <span>
          <span className="text-code">⎇ prod</span> · TypeScript
        </span>
        <span>Ln {lines.length}, Col 2 · UTF-8</span>
      </div>
    </div>
  )
}
