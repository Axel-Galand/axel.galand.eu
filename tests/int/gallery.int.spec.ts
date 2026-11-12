import { describe, expect, it } from 'vitest'

import { rowSpans } from '@/lib/gallery'

const landscape = 1.5
const portrait = 2 / 3
const pano = 3

describe('album rows', () => {
  it('puts two landscapes side by side', () => {
    expect(rowSpans([landscape, landscape])).toEqual([6, 6])
  })

  it('gives a landscape and a portrait their share of the row', () => {
    expect(rowSpans([landscape, portrait])).toEqual([8, 4])
  })

  it('fits three portraits in a row', () => {
    expect(rowSpans([portrait, portrait, portrait])).toEqual([4, 4, 4])
  })

  it('gives a panorama a row of its own', () => {
    expect(rowSpans([landscape, landscape, pano])).toEqual([6, 6, 12])
  })

  it('never stretches a short last row, nor the one before a panorama', () => {
    // A lone landscape, then a lone portrait: as wide as in a full row, not 12 columns.
    expect(rowSpans([landscape, landscape, landscape])).toEqual([6, 6, 7])
    expect(rowSpans([portrait, portrait, portrait, portrait])).toEqual([4, 4, 4, 3])
    expect(rowSpans([portrait, pano])).toEqual([3, 12])
  })

  it('treats a photo without dimensions as a landscape', () => {
    expect(rowSpans([Number.NaN, 0, landscape])).toEqual([6, 6, 7])
  })

  it('fills every full row with exactly 12 columns', () => {
    const ratios = [1.2, 0.8, 1.7, 1.33, 0.56, 0.75, 2.4, 1, 1, 1.5, 0.7, 0.9, 1.1]
    const spans = rowSpans(ratios)

    expect(spans).toHaveLength(ratios.length)
    let row = 0
    for (const span of spans) {
      expect(span).toBeGreaterThanOrEqual(2)
      expect(span).toBeLessThanOrEqual(12)
      row += span
      if (row >= 12) {
        expect(row).toBe(12)
        row = 0
      }
    }
  })
})
