import localFont from 'next/font/local'

// Self-hosted (font-src 'self'), and the build needs no network. The latin files cover French,
// œ and curly quotes included.
export const sans = localFont({
  src: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
})

export const display = localFont({
  src: '../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  weight: '300 700',
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const mono = localFont({
  src: '../../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  // Preloaded too: the home page title has a word in it, and a late swap would move the page.
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'Menlo', 'monospace'],
})
