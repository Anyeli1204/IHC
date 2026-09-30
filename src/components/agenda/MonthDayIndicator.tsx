import type { CalendarActivity } from '../../types'
import { pieGradient, statusPieSlices } from '../../lib/agendaColors'

export function MonthDayIndicator({ items, size = 28 }: { items: CalendarActivity[]; size?: number }) {
  const slices = statusPieSlices(items)
  if (items.length === 0) {
    return (
      <span
        className="inline-block shrink-0 rounded-full border border-line bg-paper"
        style={{ width: size, height: size }}
        aria-hidden
      />
    )
  }

  return (
    <span
      className="inline-block shrink-0 rounded-full border-2 border-line shadow-sm"
      style={{
        width: size,
        height: size,
        background: pieGradient(slices),
      }}
      title={`${items.length} evento${items.length === 1 ? '' : 's'}`}
      aria-hidden
    />
  )
}
