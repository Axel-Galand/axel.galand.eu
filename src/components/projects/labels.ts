import { getTranslations } from 'next-intl/server'

import type { ProjectCardLabels } from './ProjectCard'

/** The card texts, in the page's language. */
export const projectCardLabels = async (): Promise<ProjectCardLabels> => {
  const t = await getTranslations('projects')
  const tVisuals = await getTranslations('visuals')

  return {
    testing: t('testing'),
    personal: t('personal'),
    webVitals: tVisuals('webVitals'),
    draft: tVisuals('draft'),
    preview: tVisuals('preview'),
    published: tVisuals('published'),
  }
}
