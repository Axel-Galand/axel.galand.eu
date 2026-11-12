'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { rowSpans } from '@/lib/gallery'

export type GalleryPhoto = {
  id: number
  src: string
  srcSet?: string
  width?: number
  height?: number
  alt: string
  caption?: string
  blur?: string
}

type Props = {
  photos: GalleryPhoto[]
  /** The album title: the viewer's name. */
  title: string
  labels: {
    open: string
    close: string
    previous: string
    next: string
    /** "{index} / {total}", with these placeholders left in. */
    counter: string
    /** "Photo {index} sur {total}. {alt}", read out when the photo changes. */
    position: string
  }
}

const fill = (text: string, index: number, total: number) =>
  text.replace('{index}', String(index + 1)).replace('{total}', String(total))

/** Safari throws after about 100 history calls in 10 seconds: a held arrow key gets there. */
const replaceHash = (hash: string) => {
  try {
    history.replaceState(null, '', hash || location.pathname + location.search)
  } catch {
    // The photo still changes; only the address lags behind.
  }
}

const hashOf = (index: number) => `#photo-${index + 1}`

const indexOfHash = (hash: string, total: number): number | null => {
  const match = /^#photo-(\d+)$/.exec(hash)
  const index = match ? Number(match[1]) - 1 : -1

  return index >= 0 && index < total ? index : null
}

const ratioOf = ({ width, height }: GalleryPhoto) => (width && height ? width / height : 1.5)

// Static class names, so Tailwind finds them.
const spanClass: Record<number, string> = {
  2: 'min-[980px]:col-span-2',
  3: 'min-[980px]:col-span-3',
  4: 'min-[980px]:col-span-4',
  5: 'min-[980px]:col-span-5',
  6: 'min-[980px]:col-span-6',
  7: 'min-[980px]:col-span-7',
  8: 'min-[980px]:col-span-8',
  9: 'min-[980px]:col-span-9',
  10: 'min-[980px]:col-span-10',
  12: 'min-[980px]:col-span-12',
}

/**
 * The album's photos, and a viewer over them: a modal <dialog>, the arrow keys and swipes to move,
 * Escape to close, and a URL per photo (#photo-3) that opens it. Without JavaScript, each tile
 * links to its own photo on the page.
 */
export function Gallery({ photos, title, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const shown = useRef<number | null>(null)
  const [index, setIndex] = useState<number | null>(null)

  const show = useCallback((next: number) => {
    shown.current = next
    setIndex(next)
    replaceHash(hashOf(next))
    if (!dialog.current?.open) {
      dialog.current?.showModal()
      // The page behind stays still while the viewer is open.
      document.documentElement.style.overflow = 'hidden'
    }
  }, [])

  const move = useCallback(
    (step: number) => {
      if (index === null) return
      show((index + step + photos.length) % photos.length)
    },
    [index, photos.length, show],
  )

  // A shared link to #photo-3 opens that photo.
  useEffect(() => {
    const open = () => {
      const fromHash = indexOfHash(location.hash, photos.length)
      if (fromHash !== null) show(fromHash)
    }

    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [photos.length, show])

  // Focus goes back to the tile of the last photo shown.
  const closed = () => {
    const tile = document.querySelector<HTMLElement>(`${hashOf(shown.current ?? 0)} a`)

    setIndex(null)
    document.documentElement.style.overflow = ''
    replaceHash('')
    tile?.focus()
  }

  const photo = index === null ? null : photos[index]
  const spans = rowSpans(photos.map(ratioOf))

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 min-[980px]:grid-cols-12">
        {photos.map((item, position) => (
          <li key={item.id} className={spanClass[spans[position]] ?? spanClass[12]}>
            <figure id={`photo-${position + 1}`} className="flex scroll-mt-6 flex-col gap-2.5">
              <a
                href={hashOf(position)}
                aria-label={`${labels.open} ${item.alt}`.trim()}
                onClick={(event) => {
                  event.preventDefault()
                  show(position)
                }}
                className="block overflow-hidden rounded-xl border border-line bg-inset"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary does the resizing. */}
                <img
                  src={item.src}
                  srcSet={item.srcSet}
                  sizes={
                    item.srcSet
                      ? `(min-width: 980px) ${Math.round(((spans[position] ?? 12) / 12) * 100)}vw, 100vw`
                      : undefined
                  }
                  width={item.width}
                  height={item.height}
                  alt={item.alt}
                  // Only the first photo is in view on a phone.
                  loading={position === 0 ? 'eager' : 'lazy'}
                  fetchPriority={position === 0 ? 'high' : undefined}
                  decoding="async"
                  style={{
                    ...(item.blur
                      ? { backgroundImage: `url(${item.blur})`, backgroundSize: 'cover' }
                      : {}),
                    // Without dimensions, a phone would reserve no room: the page would jump.
                    ...(item.width && item.height ? {} : { aspectRatio: '3 / 2' }),
                  }}
                  className="w-full object-cover min-[980px]:h-[clamp(14rem,28vw,26rem)]"
                />
              </a>
              {item.caption ? (
                <figcaption className="font-mono text-[13px] text-muted">{item.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={closed}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') move(-1)
          if (event.key === 'ArrowRight') move(1)
        }}
        onTouchStart={(event) => {
          // One finger only: two are a pinch.
          const finger = event.touches.length === 1 ? event.touches[0] : undefined
          touch.current = finger ? { x: finger.clientX, y: finger.clientY } : null
        }}
        onTouchEnd={(event) => {
          const start = touch.current
          const end = event.changedTouches[0]
          touch.current = null
          if (!start || !end) return
          const dx = end.clientX - start.x
          const dy = end.clientY - start.y
          // A swipe is mostly sideways.
          if (Math.abs(dx) > 50 && Math.abs(dx) > 2 * Math.abs(dy)) move(dx < 0 ? 1 : -1)
        }}
        aria-label={title}
        className="inset-0 m-0 h-full max-h-none w-full max-w-none bg-[rgb(5_6_8/0.97)] p-0 text-[#fff] backdrop:bg-[rgb(0_0_0/0.7)]"
      >
        {photo ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-5 py-3 font-mono text-sm">
              <span aria-hidden="true">{fill(labels.counter, index ?? 0, photos.length)}</span>
              <span aria-live="polite" className="sr-only">
                {fill(labels.position, index ?? 0, photos.length).replace('{alt}', photo.alt)}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => dialog.current?.close()}
                aria-label={labels.close}
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-[rgb(255_255_255/0.3)] hover:bg-[rgb(255_255_255/0.1)]"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary does the resizing. */}
              <img
                key={photo.id}
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={photo.srcSet ? '100vw' : undefined}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                className="min-h-0 max-w-full flex-1 object-contain"
              />
              {photo.caption ? (
                <figcaption className="font-mono text-sm text-[rgb(255_255_255/0.8)]">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
            {photos.length > 1 ? (
              <div className="flex justify-center gap-3 pb-6">
                {(
                  [
                    [-1, labels.previous, 'M10 3L5 8l5 5'],
                    [1, labels.next, 'M6 3l5 5-5 5'],
                  ] as const
                ).map(([step, label, path]) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => move(step)}
                    aria-label={label}
                    className="grid size-12 cursor-pointer place-items-center rounded-full border border-[rgb(255_255_255/0.3)] hover:bg-[rgb(255_255_255/0.1)]"
                  >
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={path} />
                    </svg>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  )
}
