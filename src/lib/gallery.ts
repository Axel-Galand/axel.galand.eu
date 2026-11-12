const fullRow = 2.6
const panorama = 2.1

/**
 * Rows of equal height on 12 columns, each photo as wide as its shape asks: photos join a row
 * until their ratios add up to about 2.6 (a landscape and a portrait, two landscapes, three
 * portraits), then share the 12 columns in proportion. A panorama fills its row alone.
 *
 * A row left short (the last one, or the one before a panorama) keeps its photos at the width a
 * full row would give them, and leaves the rest empty: stretched across 12 columns at the row
 * height, a lone portrait would show a quarter of itself.
 */
export const rowSpans = (ratios: number[]): number[] => {
  const spans: number[] = []
  let row: number[] = []

  const flush = () => {
    const total = row.reduce((sum, ratio) => sum + ratio, 0)
    const short = total < 2 && !(row.length === 1 && row[0] >= panorama)
    const share = short ? fullRow : total
    const cells = row.map((ratio) => Math.min(12, Math.max(2, Math.round((ratio / share) * 12))))

    if (!short) {
      // Rounding may leave a column over or under: the widest photo absorbs it.
      const widest = cells.indexOf(Math.max(...cells))
      cells[widest] += 12 - cells.reduce((sum, cell) => sum + cell, 0)
    }
    spans.push(...cells)
    row = []
  }

  for (const raw of ratios) {
    // A photo without usable dimensions counts as a landscape.
    const ratio = Number.isFinite(raw) && raw > 0 ? raw : 1.5
    if (ratio >= panorama && row.length) flush()
    row.push(ratio)
    if (ratio >= panorama || row.reduce((sum, r) => sum + r, 0) >= fullRow || row.length === 3) {
      flush()
    }
  }
  if (row.length) flush()

  return spans
}
