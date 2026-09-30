import { useMemo, useState } from 'react'
import { APP_TODAY, type CalendarActivity } from '../../types'
import {
  activityIcons,
  activityStatusLabels,
  activityTypeLabels,
  formatLongDate,
  formatMonthYear,
  formatTime,
  formatWeekdayDate,
} from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { Badge, Button, ButtonLink, Card, FilterChip, PageHeader } from '../../components/ui'

type Tab = 'mes' | 'dia' | 'proximas'

export function AgendaPage() {
  const { activities } = useApp()
  const [tab, setTab] = useState<Tab>('mes')
  const [cursor, setCursor] = useState({ year: 2026, month: 4 })
  const [selectedDay, setSelectedDay] = useState(APP_TODAY)

  const days = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor])
  const ofDay = activities
    .filter((a) => a.fecha === selectedDay)
    .sort((a, b) => (a.horaInicio ?? '').localeCompare(b.horaInicio ?? ''))
  const upcoming = activities
    .filter((a) => a.fecha >= APP_TODAY && a.estado === 'programada')
    .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))

  function selectDay(iso: string) {
    setSelectedDay(iso)
    setTab('dia')
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Mes, día y próximas actividades."
        actions={<ButtonLink to="/agenda/nueva">+ Nueva actividad</ButtonLink>}
      />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['mes', 'Mes'],
            ['dia', 'Día'],
            ['proximas', 'Próximas'],
          ] as const
        ).map(([id, label]) => (
          <FilterChip key={id} active={tab === id} onClick={() => setTab(id)}>
            {label}
          </FilterChip>
        ))}
      </div>

      {tab === 'mes' ? (
        <Card>
          <div className="mb-4 flex flex-row items-center justify-between gap-3">
            <Button
              tone="secondary"
              type="button"
              onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }))}
            >
              ‹ Anterior
            </Button>
            <h2 className="text-2xl font-extrabold">{formatMonthYear(cursor.year, cursor.month)}</h2>
            <Button
              tone="secondary"
              type="button"
              onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }))}
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
                  onClick={() => selectDay(iso)}
                  className={`min-h-24 rounded-xl border p-2 text-left ${
                    isToday ? 'border-2 border-info bg-info-soft' : 'border border-line bg-paper'
                  }`}
                >
                  <span className="font-extrabold">{day}</span>
                  <ul className="mt-1 space-y-1">
                    {items.slice(0, 2).map((item) => (
                      <li key={item.id} className="truncate text-xs font-bold">
                        {activityIcons[item.tipo]} {formatTime(item.horaInicio)}
                      </li>
                    ))}
                    {items.length > 2 ? <li className="text-xs text-muted">+{items.length - 2}</li> : null}
                  </ul>
                </button>
              )
            })}
          </div>
        </Card>
      ) : null}

      {tab === 'dia' ? (
        <DayList date={selectedDay} items={ofDay} />
      ) : null}

      {tab === 'proximas' ? (
        <ul className="grid gap-4">
          {upcoming.map((item) => (
            <li key={item.id}>
              <ActivityCard item={item} showDate />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function DayList({ date, items }: { date: string; items: CalendarActivity[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">{formatWeekdayDate(date)}</h2>
      {items.length === 0 ? (
        <Card>
          <p>No hay actividades este día.</p>
          <ButtonLink to="/agenda/nueva" className="mt-4">
            + Nueva actividad
          </ButtonLink>
        </Card>
      ) : (
        items.map((item) => <ActivityCard key={item.id} item={item} />)
      )}
    </div>
  )
}

function ActivityCard({ item, showDate }: { item: CalendarActivity; showDate?: boolean }) {
  return (
    <Card>
      <p className="font-bold text-muted">
        {showDate ? `${formatLongDate(item.fecha)} · ` : ''}
        {formatTime(item.horaInicio)}
        {item.horaTermino ? ` — ${formatTime(item.horaTermino)}` : ''}
      </p>
      <p className="text-xl font-extrabold">
        {activityIcons[item.tipo]} {activityTypeLabels[item.tipo]}
      </p>
      <p>{item.titulo}</p>
      {item.casoCodigo ? <p className="text-sm text-muted">Caso {item.casoCodigo}</p> : null}
      {item.lugar ? <p className="text-sm text-muted">{item.lugar}</p> : null}
      <div className="mt-2">
        <Badge tone={item.estado === 'cancelada' ? 'urgent' : item.estado === 'realizada' ? 'ok' : 'info'}>
          {activityStatusLabels[item.estado]}
        </Badge>
      </div>
    </Card>
  )
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
