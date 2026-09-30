export const GRID_DAY_START = 6 * 60
export const GRID_DAY_END = 21 * 60
export const GRID_SNAP_MIN = 15
export const PX_PER_HOUR = 56

export function parseTimeToMinutes(value: string | undefined): number | null {
  if (!value) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return h * 60 + min
}

export function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, total))
  const h = Math.floor(clamped / 60)
  const min = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function snapMinutes(m: number, step = GRID_SNAP_MIN) {
  return Math.round(m / step) * step
}

export function clampToGrid(m: number) {
  return Math.max(GRID_DAY_START, Math.min(GRID_DAY_END, m))
}

export function yToMinutes(y: number, gridTop = 0) {
  const rel = y - gridTop
  const minutes = GRID_DAY_START + (rel / PX_PER_HOUR) * 60
  return snapMinutes(clampToGrid(minutes))
}

export function minutesToY(m: number) {
  return ((m - GRID_DAY_START) / 60) * PX_PER_HOUR
}

export function gridHeightPx() {
  return ((GRID_DAY_END - GRID_DAY_START) / 60) * PX_PER_HOUR
}

export function normalizeTimeInput(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const m = parseTimeToMinutes(trimmed)
  if (m != null) return minutesToTime(m)
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length <= 2) {
    const h = Number(digits)
    if (!Number.isNaN(h) && h >= 0 && h <= 23) return `${String(h).padStart(2, '0')}:00`
  }
  if (digits.length === 3 || digits.length === 4) {
    const h = Number(digits.slice(0, -2))
    const min = Number(digits.slice(-2))
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    }
  }
  return trimmed
}
