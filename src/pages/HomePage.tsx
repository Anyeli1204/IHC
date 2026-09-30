import type { ReactNode } from 'react'
import { CalendarDays, ChevronRight, FileText, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_TODAY } from '../types'
import {
  activityIcons,
  activityTypeLabels,
  conflictLabels,
  formatTime,
  formatWeekdayDate,
  notarialTypeLabels,
} from '../lib/format'
import { useApp } from '../store/AppContext'

const panelShell =
  'flex h-[380px] flex-col rounded-2xl border-2 border-line bg-paper p-5 shadow-sm'
const scrollArea = 'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1'

export function HomePage() {
  const { cases, notarials, activities } = useApp()

  const needsAttention = cases.filter(
    (c) => c.estado === 'en_tramite' && c.proximaAtencion && c.proximaAtencion <= APP_TODAY,
  )
  const pendingNotarial = notarials.filter((n) => n.estado === 'pendiente')

  const upcoming = activities
    .filter((a) => a.fecha >= APP_TODAY && a.estado === 'programada')
    .sort((a, b) => `${a.fecha}${a.horaInicio ?? ''}`.localeCompare(`${b.fecha}${b.horaInicio ?? ''}`))

  const atenderCount = needsAttention.length + pendingNotarial.length

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header>
        <p className="text-xl font-bold text-muted">{formatWeekdayDate(APP_TODAY)}</p>
      </header>

      <section aria-labelledby="acciones-titulo">
        <h2 id="acciones-titulo" className="mb-3 text-2xl font-extrabold">
          ¿Qué necesita hacer?
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <BigAction to="/casos" icon={<Scale size={40} aria-hidden />} lines={['Casos', 'judiciales']} />
          <BigAction
            to="/actuaciones"
            icon={<FileText size={40} aria-hidden />}
            lines={['Actuaciones', 'notariales']}
          />
          <BigAction to="/agenda" icon={<CalendarDays size={40} aria-hidden />} lines={['Ver agenda']} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-5">
        <section aria-labelledby="atender-titulo" className={panelShell}>
          <h2 id="atender-titulo" className="mb-3 shrink-0 text-xl font-extrabold tracking-wide text-muted uppercase">
            Para atender
            {atenderCount > 0 ? (
              <span className="ml-2 text-base font-extrabold text-ink">({atenderCount})</span>
            ) : null}
          </h2>

          <div className={scrollArea}>
            {atenderCount === 0 ? (
              <p className="rounded-xl border border-line bg-cream px-4 py-3 text-base text-muted">
                No hay casos ni actuaciones pendientes por hoy.
              </p>
            ) : (
              <ul className="space-y-3">
                {needsAttention.map((item) => (
                  <li key={item.id}>
                    <AtenderCard
                      to={`/casos/${item.id}`}
                      tone="urgent"
                      meta="Caso · requiere atención hoy"
                      title={item.codigo}
                      subtitle={conflictLabels[item.tipoConflicto]}
                      action="Ver caso"
                    />
                  </li>
                ))}
                {pendingNotarial.map((item) => (
                  <li key={item.id}>
                    <AtenderCard
                      to={`/actuaciones/${item.id}`}
                      tone="pending"
                      meta="Actuación pendiente"
                      title={item.codigo}
                      subtitle={notarialTypeLabels[item.tipo as keyof typeof notarialTypeLabels]}
                      action="Ver actuación"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="reuniones-titulo" className={panelShell}>
          <h2 id="reuniones-titulo" className="mb-3 shrink-0 text-xl font-extrabold tracking-wide text-muted uppercase">
            Reuniones y actividades
          </h2>

          <div className={scrollArea}>
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-line bg-cream px-4 py-3 text-base text-muted">
                No hay actividades programadas próximas.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((item) => (
                  <li key={item.id} className="rounded-xl border border-line bg-cream px-4 py-3">
                    <p className="text-sm font-bold text-muted">
                      {item.fecha === APP_TODAY ? 'Hoy' : formatWeekdayDate(item.fecha)} · {formatTime(item.horaInicio)}
                    </p>
                    <p className="text-lg font-extrabold">
                      {activityIcons[item.tipo]} {activityTypeLabels[item.tipo].toUpperCase()}
                    </p>
                    <p className="text-base">{item.titulo}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

    </div>
  )
}

function BigAction({
  to,
  icon,
  lines,
}: {
  to: string
  icon: ReactNode
  lines: string[]
}) {
  return (
    <Link
      to={to}
      className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-line bg-paper px-3 py-6 text-center shadow-sm transition hover:border-forest hover:bg-forest-soft/50"
    >
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-soft text-forest">{icon}</div>
      {lines.map((line) => (
        <span key={line} className="block text-xl font-extrabold leading-snug">
          {line}
        </span>
      ))}
    </Link>
  )
}

function AtenderCard({
  to,
  tone,
  meta,
  title,
  subtitle,
  action,
}: {
  to: string
  tone: 'urgent' | 'pending'
  meta: string
  title: string
  subtitle: string
  action: string
}) {
  const toneClass =
    tone === 'urgent'
      ? 'border-urgent bg-urgent-soft/50 text-urgent'
      : 'border-warning bg-warning-soft/50 text-warning'
  return (
    <Link
      to={to}
      className={`block rounded-xl border px-4 py-3 transition hover:opacity-90 ${toneClass}`}
    >
      <p className="text-sm font-bold opacity-90">{meta}</p>
      <p className="text-lg font-extrabold">{title}</p>
      <p className="text-base font-semibold">{subtitle}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold">
        {action}
        <ChevronRight size={16} aria-hidden />
      </p>
    </Link>
  )
}
