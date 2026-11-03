import type { Metadata } from 'next'
import React from 'react'

import { isIndexable } from '@/lib/seo/indexing'
import './styles.css'

// Evaluated at build time for static pages: set SITE_INDEXABLE as a build variable too.
// The X-Robots-Tag header set in proxy.ts covers the runtime value.
export const metadata: Metadata = {
  description: 'Développeur web full-stack.',
  title: 'Axel Galand',
  robots: isIndexable() ? undefined : { index: false, follow: false },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
