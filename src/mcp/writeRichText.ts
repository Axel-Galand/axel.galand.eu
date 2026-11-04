import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { PayloadRequest, RichTextField } from 'payload'
import { z } from 'zod'

import { codeLanguages } from '@/collections/Notes'

// Rich text fields Claude may write, per target. Anything else is refused.
const collectionTargets = {
  'case-studies': ['context', 'challenge', 'work', 'result', 'learnings'],
  notes: ['body'],
} as const
const globalTargets = {
  profile: ['bio'],
} as const

const parameters = {
  target: z
    .enum(['case-studies', 'notes', 'profile'])
    .describe('Where the field lives: a case study, a note, or the profile global.'),
  id: z
    .union([z.number(), z.string()])
    .optional()
    .describe('Document id. Required for case-studies and notes, ignored for profile.'),
  field: z
    .string()
    .describe(
      'case-studies: context, challenge, work, result or learnings. notes: body. profile: bio.',
    ),
  locale: z.enum(['fr', 'en']).describe('Content locale to write.'),
  markdown: z
    .string()
    .min(1)
    .describe('The field content as Markdown. Fenced code blocks become code blocks in notes.'),
}

const findRichTextField = (fields: { name?: string; type: string }[], name: string) => {
  const field = fields.find((candidate) => candidate.name === name)

  if (!field || field.type !== 'richText') {
    throw new Error(`Field "${name}" is not a rich text field`)
  }

  return field as RichTextField
}

type LexicalNode = { type?: string; fields?: Record<string, unknown>; children?: LexicalNode[] }

// A fence in a language the Code block does not list (```go) would save as a draft, then fail
// validation on publish. Such blocks fall back to plain text.
const normalizeCodeLanguages = (node: LexicalNode) => {
  if (node.type === 'block' && node.fields?.blockType === 'Code') {
    const language = node.fields.language

    if (typeof language !== 'string' || !(language in codeLanguages)) {
      node.fields.language = 'plaintext'
    }
  }

  node.children?.forEach(normalizeCodeLanguages)
}

/** Markdown → Lexical with the field's own editor config (so its blocks, like Code, are known). */
export const richTextFromMarkdown = (
  fields: { name?: string; type: string }[],
  name: string,
  markdown: string,
) => {
  const state = convertMarkdownToLexical({
    editorConfig: editorConfigFactory.fromField({ field: findRichTextField(fields, name) }),
    markdown,
  })

  normalizeCodeLanguages(state.root as LexicalNode)

  return state
}

/**
 * Lexical's JSON is too verbose to write reliably by hand, so Claude sends Markdown and the server
 * converts it with the field's own editor config. Saves always land as drafts (the MCP request
 * also goes through forceDraftForMcp).
 */
export const writeRichTextTool = {
  name: 'writeRichText',
  description:
    'Write one rich text field of a case study, a note or the profile from Markdown. The server converts it to Lexical and saves a draft; publishing stays manual in the admin. This tool has its own toggle on the API key: the per-collection toggles do not apply to it.',
  parameters,
  handler: async (rawArgs: Record<string, unknown>, req: PayloadRequest) => {
    const { target, id, field, locale, markdown } = z.object(parameters).parse(rawArgs)

    if (target === 'profile') {
      if (!(globalTargets.profile as readonly string[]).includes(field)) {
        throw new Error(`profile only accepts: ${globalTargets.profile.join(', ')}`)
      }

      const global = req.payload.globals.config.find((candidate) => candidate.slug === target)!
      const content = richTextFromMarkdown(global.flattenedFields, field, markdown)

      await req.payload.updateGlobal({
        slug: target,
        data: { [field]: content },
        locale,
        draft: true,
        overrideAccess: false,
        user: req.user,
        req,
      })

      return {
        content: [
          { type: 'text' as const, text: `Saved profile.${field} (${locale}) as a draft.` },
        ],
      }
    }

    const allowed = collectionTargets[target] as readonly string[]

    if (!allowed.includes(field)) {
      throw new Error(`${target} only accepts: ${allowed.join(', ')}`)
    }

    if (id === undefined) {
      throw new Error(`An id is required for ${target}`)
    }

    const content = richTextFromMarkdown(
      req.payload.collections[target].config.flattenedFields,
      field,
      markdown,
    )

    await req.payload.update({
      collection: target,
      id,
      data: { [field]: content },
      locale,
      draft: true,
      overrideAccess: false,
      user: req.user,
      req,
    })

    return {
      content: [
        { type: 'text' as const, text: `Saved ${target} ${id} ${field} (${locale}) as a draft.` },
      ],
    }
  },
}
