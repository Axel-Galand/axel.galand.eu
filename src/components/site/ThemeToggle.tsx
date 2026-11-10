'use client'

import { useSyncExternalStore } from 'react'

import { type Theme, storeTheme, systemTheme, storedTheme } from '@/lib/theme'

const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
}

/** Follows data-theme on <html>, and the system theme until the visitor picks one. */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const follow = () => {
    if (!storedTheme()) applyTheme(systemTheme())
  }

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  // A page React renders on the client (the 404) never ran the inline script, and React clears the
  // attributes of <html> when it renders it: set the theme here too.
  if (!document.documentElement.dataset.theme) applyTheme(storedTheme() ?? systemTheme())
  media.addEventListener('change', follow)

  return () => {
    observer.disconnect()
    media.removeEventListener('change', follow)
  }
}

/**
 * Light / dark switch. The new theme opens in a circle from the button (View Transitions), fades
 * where the API is missing, and changes at once with reduced motion. The choice is kept in
 * localStorage; until then the site follows the system, live.
 */
export function ThemeToggle({ label }: { label: string }) {
  // Unknown on the server: aria-pressed only appears once the page runs.
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null)

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const commit = () => {
      applyTheme(next)
      storeTheme(next)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit()
      return
    }

    if (!document.startViewTransition) {
      root.classList.add('theme-fade')
      commit()
      window.setTimeout(() => root.classList.remove('theme-fade'), 500)
      return
    }

    const box = event.currentTarget.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = document.startViewTransition(commit)

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: Math.min(1100, Math.max(550, radius * 0.5)),
            easing: 'cubic-bezier(.65, 0, .35, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      // A transition skipped by the browser (tab hidden, another one starting) still applied the theme.
      .catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === null ? undefined : theme === 'dark'}
      data-testid="theme-toggle"
      className="relative h-11 w-16 cursor-pointer"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1.5 h-8 rounded-full border border-line-strong bg-surface"
      />
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-1 grid size-6 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 ease-[cubic-bezier(.5,1.6,.4,1)] dark:translate-x-8 dark:rotate-[360deg]"
      >
        <svg
          className="dark:hidden"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="2.6" />
          <path d="M7 .8v1.6M7 11.6v1.6M.8 7h1.6M11.6 7h1.6M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1" />
        </svg>
        <svg
          className="hidden dark:block"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="currentColor"
        >
          <path d="M11.8 8.6A5.2 5.2 0 015.4 2.2 5.4 5.4 0 1011.8 8.6z" />
        </svg>
      </span>
    </button>
  )
}
