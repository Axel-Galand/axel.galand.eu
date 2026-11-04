import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Only the grammars the notes editor offers (see `codeLanguages` in Notes.ts): a small server
// bundle, and the JavaScript regex engine needs no wasm in the standalone image.
const grammars = {
  css: () => import('shiki/langs/css.mjs'),
  diff: () => import('shiki/langs/diff.mjs'),
  docker: () => import('shiki/langs/docker.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  ini: () => import('shiki/langs/ini.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  nginx: () => import('shiki/langs/nginx.mjs'),
  php: () => import('shiki/langs/php.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  scss: () => import('shiki/langs/scss.mjs'),
  shellscript: () => import('shiki/langs/shellscript.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  toml: () => import('shiki/langs/toml.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  xml: () => import('shiki/langs/xml.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
}

type Grammar = keyof typeof grammars

const aliases: Record<string, Grammar> = {
  ts: 'typescript',
  js: 'javascript',
  shell: 'shellscript',
  bash: 'shellscript',
  sh: 'shellscript',
  zsh: 'shellscript',
  yml: 'yaml',
  dockerfile: 'docker',
  py: 'python',
}

let highlighter: Promise<HighlighterCore> | undefined

const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
    langs: Object.values(grammars).map((load) => load()),
    engine: createJavaScriptRegexEngine(),
  }))

export const grammarFor = (language: string | null | undefined): Grammar | 'text' =>
  language && language in grammars ? (language as Grammar) : (aliases[language ?? ''] ?? 'text')

/** Highlighted on the server: the page ships HTML, no highlighter. */
export async function CodeBlock({ code, language }: { code: string; language?: string | null }) {
  const html = (await getHighlighter()).codeToHtml(code, {
    lang: grammarFor(language),
    themes: { light: 'github-light', dark: 'github-dark' },
  })

  // Shiki escapes the code itself.
  return <div className="code" dangerouslySetInnerHTML={{ __html: html }} />
}
