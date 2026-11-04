import type { SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  LinkJSXConverter,
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import type { Locale } from '@/i18n/locales'
import { documentPath, homePath, isSectionSlug } from '@/lib/paths'
import type { Media } from '@/payload-types'

import { CodeBlock } from './CodeBlock'
import { Picture } from './Picture'

type CodeFields = { code?: string; language?: string | null }

const converters =
  (locale: Locale): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => {
        const { relationTo, value } = linkNode.fields.doc ?? {}
        const target = typeof value === 'object' && value ? (value as Record<string, unknown>) : {}
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
  })

type Props = { data: unknown; locale: Locale; className?: string }

export function RichText({ data, locale, className }: Props) {
  if (!data) {
    return null
  }

  return (
    <LexicalRichText
      className={className}
      data={data as SerializedEditorState}
      converters={converters(locale)}
      disableContainer={!className}
    />
  )
}
