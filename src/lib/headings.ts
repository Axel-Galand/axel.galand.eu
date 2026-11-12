type LexicalNode = { type?: string; tag?: string; text?: string; children?: LexicalNode[] }

type Level = 1 | 2 | 3 | 4 | 5 | 6

/** The plain text of a Lexical node and its children. */
export const nodeText = (node: LexicalNode): string =>
  node.text ?? (node.children ?? []).map(nodeText).join('')

/** "Pourquoi ufw ne voit rien" → "pourquoi-ufw-ne-voit-rien". */
export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section'

// Ids the page itself uses: the skip link's target.
const pageIds = ['main']

/**
 * Gives each heading a unique id, in document order. The table of contents and the rendered
 * headings each use their own generator over the same sequence, so their ids agree. A prefix keeps
 * the headings of one field apart from another's on the same page.
 */
export const headingIds = (prefix = '') => {
  const used = new Set(pageIds)

  return (text: string) => {
    const base = `${prefix ? `${prefix}-` : ''}${slugify(text)}`
    let id = base

    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return id
  }
}

/** The level a heading is drawn at: never above `minLevel`, so a field never outranks the page. */
export const headingLevel = (tag: string | undefined, minLevel: Level): Level =>
  Math.min(6, Math.max(minLevel, Number(tag?.slice(1)) || 6)) as Level

export type TocEntry = { id: string; text: string }

/** The headings of a rich text field drawn at `minLevel` (its sections), for a table of contents. */
export const tableOfContents = (data: unknown, minLevel: Level = 2, prefix = ''): TocEntry[] => {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root
  const nextId = headingIds(prefix)
  const entries: TocEntry[] = []

  for (const node of root?.children ?? []) {
    if (node.type !== 'heading') continue
    const text = nodeText(node).trim()
    const id = nextId(text)
    if (headingLevel(node.tag, minLevel) === minLevel && text) entries.push({ id, text })
  }

  return entries
}

/** Whether a rich text field holds anything: a field cleared in the admin keeps an empty root. */
export const hasContent = (data: unknown): boolean => {
  const children = (data as { root?: LexicalNode } | null | undefined)?.root?.children ?? []

  return children.some((node) => node.type !== 'paragraph' || nodeText(node).trim() !== '')
}
