import type { CalendarActivity } from '../../types'
import { activityStatusColors } from '../../lib/agendaColors'
import { formatTime } from '../../lib/format'
import {
  GRID_DAY_END,
  GRID_DAY_START,
  PX_PER_HOUR,
  gridHeightPx,
  minutesToY,
  parseTimeToMinutes,
} from '../../lib/timeGrid'

export function DayTimeGrid({
  items,
  onSelect,
}: {
  items: CalendarActivity[]
  onSelect: (item: CalendarActivity) => void
}) {
  const hours = []
  for (let h = GRID_DAY_START / 60; h <= GRID_DAY_END / 60; h++) hours.push(h)
  const height = gridHeightPx()

  const timed = items.filter((a) => a.horaInicio)
  const untimed = items.filter((a) => !a.horaInicio)

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border-2 border-line bg-paper">
        <div className="flex">
          <div className="w-16 shrink-0 border-r border-line bg-cream pt-2 text-right text-sm font-bold text-muted">
            {hours.map((h) => (
              <div key={h} style={{ height: PX_PER_HOUR }} className="pr-2">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="relative flex-1" style={{ height }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-line/80"
                style={{ top: minutesToY(h * 60) }}
              />
            ))}
            {timed.map((ev) => {
              const s = parseTimeToMinutes(ev.horaInicio) ?? GRID_DAY_START
              const e =
                parseTimeToMinutes(ev.horaTermino) ?? Math.min(GRID_DAY_END, s + 60)
              const colors = activityStatusColors[ev.estado]
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev)}
                  className="absolute left-2 right-2 overflow-hidden rounded-xl border-2 text-left shadow-sm transition hover:brightness-95"
                  style={{
                    top: minutesToY(s),
                    height: Math.max(36, minutesToY(e) - minutesToY(s)),
                    background: colors.fill,
                    borderColor: colors.border,
                  }}
                >
                  <p className="truncate px-3 py-1 text-base font-extrabold">{ev.titulo}</p>
                  <p className="px-3 pb-2 text-sm font-bold opacity-80">
                    {formatTime(ev.horaInicio)}
                    {ev.horaTermino ? ` — ${formatTime(ev.horaTermino)}` : ''}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {untimed.length > 0 ? (
        <div>
          <h3 className="mb-2 text-lg font-extrabold">Sin hora definida</h3>
          <ul className="grid gap-2">
            {untimed.map((ev) => (
              <li key={ev.id}>
                <DayEventRow item={ev} onClick={() => onSelect(ev)} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {timed.length > 0 ? (
        <div>
          <h3 className="mb-2 text-lg font-extrabold">Lista del día</h3>
          <ul className="grid gap-2">
            {timed.map((ev) => (
              <li key={ev.id}>
                <DayEventRow item={ev} onClick={() => onSelect(ev)} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function DayEventRow({ item, onClick }: { item: CalendarActivity; onClick: () => void }) {
  const colors = activityStatusColors[item.estado]
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-bold transition hover:brightness-95"
      style={{ background: colors.fill, borderColor: colors.border }}
    >
      <span
        className="h-4 w-4 shrink-0 rounded-full border-2"
        style={{ background: colors.fill, borderColor: colors.border }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-lg font-extrabold">{item.titulo}</span>
      {item.horaInicio ? (
        <span className="shrink-0 text-sm font-bold opacity-90">
          {formatTime(item.horaInicio)}
          {item.horaTermino ? ` — ${formatTime(item.horaTermino)}` : ''}
        </span>
      ) : null}
    </button>
  )
}
