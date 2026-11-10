'use client'

import { useState } from 'react'

type Props = {
  items: { name: string; separator: string }[]
  /** The list for screen readers, as a sentence. */
  summary: string
  pauseLabel: string
}

/**
 * The scrolling band of the stack. It stops on hover, and its button stops it for good: moving
 * content that lasts more than 5 seconds needs a pause (WCAG 2.2.2).
 */
export function Marquee({ items, summary, pauseLabel }: Props) {
  const [paused, setPaused] = useState(false)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface py-[18px] min-[980px]:col-span-3">
      <div
        aria-hidden="true"
        className={`flex w-max animate-marquee gap-10 pr-16 pl-10 font-display text-[22px] font-semibold whitespace-nowrap text-ink-2 group-hover:[animation-play-state:paused] ${
          paused ? '[animation-play-state:paused]' : ''
        }`}
      >
        {[...items, ...items].map((item, index) => (
          <span key={index} className="flex gap-10">
            <span>{item.name}</span>
            <span className={item.separator}>/</span>
          </span>
        ))}
      </div>
      <p className="sr-only">{summary}</p>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={pauseLabel}
        className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-2"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          {paused ? (
            <path d="M3 1.5v11l9-5.5z" />
          ) : (
            <>
              <rect x="2.5" y="1.5" width="3" height="11" rx="1" />
              <rect x="8.5" y="1.5" width="3" height="11" rx="1" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
