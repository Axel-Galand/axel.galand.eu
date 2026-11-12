import type { SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  LinkJSXConverter,
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import type { Locale } from '@/i18n/locales'
import { headingIds, headingLevel, nodeText } from '@/lib/headings'
import { documentPath, homePath, isSectionSlug } from '@/lib/paths'
import type { Media } from '@/payload-types'

import { CodeBlock } from './CodeBlock'
import { Picture } from './Picture'

type CodeFields = { code?: string; language?: string | null }

type HeadingNode = { tag?: string; children?: unknown[] }

type Options = { locale: Locale; minLevel: 2 | 3; idPrefix: string }

const converters =
  ({ locale, minLevel, idPrefix }: Options): JSXConvertersFunction =>
  ({ defaultConverters }) => {
    // Ids for the table of contents (see tableOfContents), counted in document order.
    const nextId = headingIds(idPrefix)

    return {
      ...defaultConverters,
      heading: ({ node, nodesToJSX }) => {
        const { tag, children = [] } = node as unknown as HeadingNode
        const Tag = `h${headingLevel(tag, minLevel)}` as const

        return (
          <Tag id={nextId(nodeText(node as never))}>{nodesToJSX({ nodes: children as never })}</Tag>
        )
      },
      ...LinkJSXConverter({
        internalDocToHref: ({ linkNode }) => {
          const { relationTo, value } = linkNode.fields.doc ?? {}
          const target =
            typeof value === 'object' && value ? (value as Record<string, unknown>) : {}
          // Without its title in this locale (no fallback), the target has no page here.
          const slug = target.title ? target.slug : undefined

          return relationTo && isSectionSlug(relationTo) && typeof slug === 'string'
            ? documentPath(relationTo, slug, locale)
            : homePath(locale)
        },
      }),
      upload: ({ node }: { node: SerializedUploadNode }) => (
        <figure>
          <Picture media={node.value as Media} sizes="(min-width: 48rem) 48rem, 100vw" />
        </figure>
      ),
      blocks: {
        Code: ({ node }: { node: { fields: unknown } }) => {
          const { code, language } = node.fields as CodeFields

          return <CodeBlock code={code ?? ''} language={language} />
        },
      },
    }
  }

type Props = {
  data: unknown
  locale: Locale
  className?: string
  /**
   * The highest heading level the text may use: 2 under the page title (a note), 3 inside a
   * titled section (a case study). Higher headings, from the editor or Markdown, are drawn at it.
   */
  minLevel?: 2 | 3
  /** Prefixes the heading ids, when a page shows several rich text fields. */
  idPrefix?: string
}

export function RichText({ data, locale, className, minLevel = 2, idPrefix = '' }: Props) {
  if (!data) {
    return null
  }

  return (
    <LexicalRichText
      className={className}
      data={data as SerializedEditorState}
      converters={converters({ locale, minLevel, idPrefix })}
      disableContainer={!className}
    />
  )
}
