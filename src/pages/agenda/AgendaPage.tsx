import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { APP_TODAY, type CalendarActivity } from '../../types'
import { formatMonthYear, formatWeekdayDate } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { ActivityDetailModal } from '../../components/agenda/ActivityDetailModal'
import { DayTimeGrid } from '../../components/agenda/DayTimeGrid'
import { MonthDayIndicator } from '../../components/agenda/MonthDayIndicator'
import { Button, Card, FilterChip, PageHeader } from '../../components/ui'

type View = 'mes' | 'dia'

export function AgendaPage() {
  const { activities } = useApp()
  const [view, setView] = useState<View>('mes')
  const [cursor, setCursor] = useState(() => dateParts(APP_TODAY))
  const [selectedDay, setSelectedDay] = useState(APP_TODAY)
  const [detail, setDetail] = useState<CalendarActivity | null>(null)

  const days = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor])
  const ofDay = activities
    .filter((a) => a.fecha === selectedDay)
    .sort((a, b) => (a.horaInicio ?? '').localeCompare(b.horaInicio ?? ''))

  function openDay(iso: string) {
    setSelectedDay(iso)
    setView('dia')
  }

  return (
    <div className="relative pb-24">
      <PageHeader title="Agenda" subtitle="Calendario de actividades y reuniones." />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {(
            [
              ['mes', 'Mes'],
              ['dia', 'Día'],
            ] as const
          ).map(([id, label]) => (
            <FilterChip key={id} active={view === id} onClick={() => setView(id)}>
              {label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-muted">
          <span className="inline-flex items-center gap-2">
            <MonthDayIndicator items={[{ ...emptyAct, estado: 'programada' }]} size={16} /> Programada
          </span>
          <span className="inline-flex items-center gap-2">
            <MonthDayIndicator items={[{ ...emptyAct, estado: 'realizada' }]} size={16} /> Realizada
          </span>
          <span className="inline-flex items-center gap-2">
            <MonthDayIndicator items={[{ ...emptyAct, estado: 'cancelada' }]} size={16} /> Cancelada
          </span>
        </div>
      </div>

      {view === 'mes' ? (
        <Card>
          <div className="mb-4 flex flex-row items-center justify-between gap-3">
            <Button
              tone="secondary"
              type="button"
              onClick={() =>
                setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }))
              }
            >
              ‹ Anterior
            </Button>
            <h2 className="text-2xl font-extrabold">{formatMonthYear(cursor.year, cursor.month)}</h2>
            <Button
              tone="secondary"
              type="button"
              onClick={() =>
                setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }))
              }
            >
              Siguiente ›
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold text-muted">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />
              const iso = toISO(cursor.year, cursor.month, day)
              const items = activities.filter((a) => a.fecha === iso)
              const isToday = iso === APP_TODAY
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => openDay(iso)}
                  className={`flex min-h-28 flex-col items-center gap-2 rounded-xl border p-2 transition hover:brightness-[0.98] ${
                    isToday ? 'border-2 border-info bg-info-soft' : 'border border-line bg-paper'
                  }`}
                >
                  <span className="w-full text-left font-extrabold">{day}</span>
                  <MonthDayIndicator items={items} size={32} />
                  {items.length > 0 ? (
                    <span className="w-full truncate text-left text-xs font-bold text-muted">
                      {items.length} evento{items.length === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </Card>
      ) : null}

      {view === 'dia' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold">{formatWeekdayDate(selectedDay)}</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                tone="secondary"
                type="button"
                onClick={() => setSelectedDay(shiftDay(selectedDay, -1))}
              >
                ‹ Día anterior
              </Button>
              <Button tone="secondary" type="button" onClick={() => setSelectedDay(APP_TODAY)}>
                Hoy
              </Button>
              <Button
                tone="secondary"
                type="button"
                onClick={() => setSelectedDay(shiftDay(selectedDay, 1))}
              >
                Día siguiente ›
              </Button>
            </div>
          </div>

          {ofDay.length === 0 ? (
            <Card>
              <p className="text-lg">No hay eventos este día.</p>
              <Link
                to={`/agenda/nueva?fecha=${selectedDay}`}
                className="touch-target mt-4 inline-flex items-center justify-center rounded-xl bg-forest px-5 py-3 font-bold text-paper"
              >
                + Añadir evento
              </Link>
            </Card>
          ) : (
            <DayTimeGrid items={ofDay} onSelect={setDetail} />
          )}
        </div>
      ) : null}

      <Link
        to={`/agenda/nueva?fecha=${view === 'dia' ? selectedDay : APP_TODAY}`}
        className="fixed bottom-8 right-[max(1.5rem,calc(50%-36rem))] z-40 flex h-20 w-20 items-center justify-center rounded-full border-4 border-paper bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-ink shadow-[0_8px_32px_rgba(234,179,8,0.55)] transition hover:scale-105 hover:shadow-[0_12px_40px_rgba(234,179,8,0.65)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-forest"
        aria-label="Añadir nuevo evento"
        title="Nuevo evento"
      >
        <Plus size={44} strokeWidth={3} aria-hidden />
      </Link>

      {detail ? <ActivityDetailModal item={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  )
}

const emptyAct = {
  id: '',
  titulo: '',
  tipo: 'otra' as const,
  fecha: '',
  estado: 'programada' as const,
  createdAt: '',
  updatedAt: '',
  syncStatus: 'synced' as const,
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [...Array(startOffset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dateParts(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  return { year: y, month: m - 1 }
}

function shiftDay(iso: string, delta: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}
