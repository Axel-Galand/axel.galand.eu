export type Theme = 'light' | 'dark'

const key = 'theme'

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark'

/** The visitor's choice, if they made one. Storage can be blocked (private mode, settings). */
export const storedTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(key)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export const storeTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(key, theme)
  } catch {
    // The theme still applies to this page.
  }
}

export const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

/**
 * Runs inline in <head>, before the first paint, so a dark page never flashes light. It must stay
 * self-contained: it is serialized as is. The CSP allows inline scripts (Next needs them too).
 */
export const themeScript = `(function(){var t;try{t=localStorage.getItem('${key}')}catch(e){}if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t})()`
