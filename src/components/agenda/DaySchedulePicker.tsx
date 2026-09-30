import { useCallback, useRef, useState } from 'react'
import type { ActivityStatus, CalendarActivity } from '../../types'
import { activityStatusColors } from '../../lib/agendaColors'
import {
  GRID_DAY_END,
  GRID_DAY_START,
  PX_PER_HOUR,
  clampToGrid,
  gridHeightPx,
  minutesToTime,
  minutesToY,
  parseTimeToMinutes,
  snapMinutes,
  yToMinutes,
} from '../../lib/timeGrid'
import { Button } from '../ui'

type DragMode = 'create' | 'move' | 'resize-start' | 'resize-end'

type Props = {
  horaInicio: string
  horaTermino: string
  onChange: (start: string, end: string) => void
  otherEvents?: CalendarActivity[]
  activeId?: string
  estado?: ActivityStatus
}

export function DaySchedulePicker({
  horaInicio,
  horaTermino,
  onChange,
  otherEvents = [],
  activeId,
  estado = 'programada',
}: Props) {
  const [open, setOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: DragMode
    pointerAtDown: number
    anchorStart: number
    anchorEnd: number
  } | null>(null)

  const startMin = parseTimeToMinutes(horaInicio) ?? 9 * 60
  const endMin = parseTimeToMinutes(horaTermino) ?? startMin + 60
  const safeEnd = endMin > startMin ? endMin : startMin + 60

  const hours = []
  for (let h = GRID_DAY_START / 60; h <= GRID_DAY_END / 60; h++) hours.push(h)

  const applyRange = useCallback(
    (start: number, end: number) => {
      let s = snapMinutes(clampToGrid(start))
      let e = snapMinutes(clampToGrid(end))
      if (e <= s) e = Math.min(GRID_DAY_END, s + 30)
      onChange(minutesToTime(s), minutesToTime(e))
    },
    [onChange],
  )

  function pointerY(clientY: number) {
    const grid = gridRef.current
    if (!grid) return GRID_DAY_START
    const rect = grid.getBoundingClientRect()
    return yToMinutes(clientY, rect.top)
  }

  function onGridPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).dataset.eventBlock) return
    e.preventDefault()
    const m = pointerY(e.clientY)
    dragRef.current = { mode: 'create', pointerAtDown: m, anchorStart: m, anchorEnd: m + 60 }
    applyRange(m, m + 60)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onGridPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    const m = pointerY(e.clientY)
    if (d.mode === 'create') {
      const a = d.pointerAtDown
      const b = m
      applyRange(Math.min(a, b), Math.max(a, b) || a + 60)
    } else if (d.mode === 'move') {
      const dur = d.anchorEnd - d.anchorStart
      const delta = m - d.pointerAtDown
      let nextStart = snapMinutes(d.anchorStart + delta)
      nextStart = clampToGrid(nextStart)
      let nextEnd = nextStart + dur
      if (nextEnd > GRID_DAY_END) {
        nextEnd = GRID_DAY_END
        nextStart = nextEnd - dur
      }
      if (nextStart < GRID_DAY_START) {
        nextStart = GRID_DAY_START
        nextEnd = nextStart + dur
      }
      applyRange(nextStart, nextEnd)
    } else if (d.mode === 'resize-start') {
      applyRange(Math.min(m, d.anchorEnd - 15), d.anchorEnd)
    } else if (d.mode === 'resize-end') {
      applyRange(d.anchorStart, Math.max(m, d.anchorStart + 15))
    }
  }

  function onGridPointerUp(e: React.PointerEvent) {
    dragRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  function startBlockDrag(e: React.PointerEvent, mode: DragMode) {
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = {
      mode,
      pointerAtDown: pointerY(e.clientY),
      anchorStart: startMin,
      anchorEnd: safeEnd,
    }
    ;(gridRef.current as HTMLElement)?.setPointerCapture(e.pointerId)
  }

  const height = gridHeightPx()
  const activeColors = activityStatusColors[estado]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" tone={open ? 'primary' : 'secondary'} onClick={() => setOpen((v) => !v)}>
          {open ? 'Ocultar planilla horaria' : 'Seleccionar en planilla'}
        </Button>
        <p className="text-sm font-semibold text-muted">
          Arrastre en la grilla para crear, mover o alargar el evento (como en un calendario).
        </p>
      </div>

      {open ? (
        <div className="overflow-hidden rounded-2xl border-2 border-line bg-paper">
          <div className="flex">
            <div className="w-16 shrink-0 border-r border-line bg-cream pt-2 text-right text-sm font-bold text-muted">
              {hours.map((h) => (
                <div key={h} style={{ height: PX_PER_HOUR }} className="pr-2">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            <div
              ref={gridRef}
              className="relative flex-1 cursor-crosshair touch-none select-none"
              style={{ height }}
              onPointerDown={onGridPointerDown}
              onPointerMove={onGridPointerMove}
              onPointerUp={onGridPointerUp}
              onPointerCancel={onGridPointerUp}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="pointer-events-none absolute left-0 right-0 border-t border-line/80"
                  style={{ top: minutesToY(h * 60) }}
                />
              ))}

              {otherEvents
                .filter((ev) => ev.id !== activeId && ev.horaInicio)
                .map((ev) => {
                  const s = parseTimeToMinutes(ev.horaInicio) ?? GRID_DAY_START
                  const e =
                    parseTimeToMinutes(ev.horaTermino) ??
                    Math.min(GRID_DAY_END, s + 60)
                  const colors = activityStatusColors[ev.estado]
                  return (
                    <div
                      key={ev.id}
                      data-event-block="1"
                      className="pointer-events-none absolute left-2 right-2 overflow-hidden rounded-lg border-2 opacity-50"
                      style={{
                        top: minutesToY(s),
                        height: Math.max(24, minutesToY(e) - minutesToY(s)),
                        background: colors.fill,
                        borderColor: colors.border,
                      }}
                    >
                      <p className="truncate px-2 py-1 text-xs font-extrabold">{ev.titulo}</p>
                    </div>
                  )
                })}

              <div
                data-event-block="1"
                className="absolute left-2 right-2 z-10 overflow-hidden rounded-xl border-2 shadow-md"
                style={{
                  top: minutesToY(startMin),
                  height: Math.max(32, minutesToY(safeEnd) - minutesToY(startMin)),
                  background: activeColors.fill,
                  borderColor: activeColors.border,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-3 cursor-ns-resize bg-ink/10"
                  onPointerDown={(e) => startBlockDrag(e, 'resize-start')}
                />
                <div
                  className="flex h-full cursor-grab flex-col justify-center px-3 py-4 active:cursor-grabbing"
                  onPointerDown={(e) => startBlockDrag(e, 'move')}
                >
                  <p className="text-sm font-extrabold">
                    {horaInicio || minutesToTime(startMin)} — {horaTermino || minutesToTime(safeEnd)}
                  </p>
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 h-3 cursor-ns-resize bg-ink/10"
                  onPointerDown={(e) => startBlockDrag(e, 'resize-end')}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
