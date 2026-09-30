import { useParams } from 'react-router-dom'
import { CalendarClock, FileText, MapPin, Pencil, UserRound } from 'lucide-react'
import { COURT_NAME } from '../../types'
import { caseStatusLabels, conflictLabels, formatLongDate, formatShortDate, progressLabels, roleLabels } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { Badge, ButtonLink, Card, EmptyState } from '../../components/ui'

export function CaseSummaryPage() {
  const { id } = useParams()
  const { cases } = useApp()
  const item = cases.find((record) => record.id === id || record.codigo === id)

  if (!item) {
    return (
      <div className="space-y-4">
        <EmptyState title="No encontramos este caso" text="Vuelva a la lista y búsquelo por nombre o código." />
        <ButtonLink to="/casos" tone="secondary">← Volver a casos</ButtonLink>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <ButtonLink to="/casos" tone="secondary">← Volver a casos</ButtonLink>
        <ButtonLink to={`/casos/${item.id}/editar`}><Pencil size={20} /> Editar caso</ButtonLink>
      </div>

      <header className="rounded-2xl border-2 border-line bg-paper p-5">
        <p className="font-extrabold text-forest">CASO {item.codigo}</p>
        <h1 className="text-3xl font-extrabold">{conflictLabels[item.tipoConflicto]}</h1>
        <p className="mt-1 text-lg">{item.motivo}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={item.estado === 'concluido' ? 'ok' : 'info'}>{caseStatusLabels[item.estado]}</Badge>
          <Badge tone="neutral">Registrado: {formatLongDate(item.fechaRegistro)}</Badge>
          {item.syncStatus === 'pending' ? <Badge tone="pending">Pendiente de sincronización</Badge> : null}
        </div>
        <p className="mt-3 text-sm font-bold text-muted">{COURT_NAME} · {item.registradoPor ?? 'Juez de Paz responsable'}</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card className="flex h-[34rem] flex-col overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-line pb-3 text-xl font-extrabold"><FileText className="text-forest" /> Datos del caso</h2>
          <dl className="flex-1 space-y-4 overflow-y-auto pt-4">
            <div><dt className="font-bold text-muted">Código</dt><dd>{item.codigo}</dd></div>
            <div><dt className="font-bold text-muted">Materia</dt><dd>{conflictLabels[item.tipoConflicto]}</dd></div>
            <div><dt className="font-bold text-muted">Descripción de la controversia</dt><dd>{item.motivo}</dd></div>
            <div><dt className="flex items-center gap-1 font-bold text-muted"><MapPin size={17} /> Lugar</dt><dd>{item.lugarRegistro ?? 'Santa Rosa'}</dd></div>
            <div><dt className="font-bold text-muted">Fecha de registro</dt><dd>{formatLongDate(item.fechaRegistro)}</dd></div>
            <div><dt className="font-bold text-muted">Estado del caso</dt><dd>{caseStatusLabels[item.estado]}</dd></div>
            {item.observaciones ? <div><dt className="font-bold text-muted">Observaciones</dt><dd>{item.observaciones}</dd></div> : null}
            {item.resultadoFinal ? <div><dt className="font-bold text-muted">Resultado final</dt><dd>{item.resultadoFinal}</dd></div> : null}
          </dl>
        </Card>

        <Card className="flex h-[34rem] flex-col overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-line pb-3 text-xl font-extrabold"><UserRound className="text-forest" /> Partes involucradas</h2>
          <ul className="flex-1 space-y-3 overflow-y-auto pt-4">
            {item.personas.map((person) => (
              <li key={person.id} className="rounded-xl border border-line bg-cream p-4">
                <p className="text-lg font-extrabold">{person.nombres} {person.apellidos ?? ''}</p>
                <p className="font-bold">{person.rolEnCaso || roleLabels[person.participacion]}</p>
                {person.numeroDocumento ? <p>{person.tipoDocumento || 'Documento'} {person.numeroDocumento}</p> : null}
                <p>Domicilio: {person.comunidad}</p>
                {person.telefono ? <p className="text-muted">Teléfono: {person.codigoPais ?? '+51'} {person.telefono}</p> : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex h-[34rem] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><CalendarClock className="text-forest" /> Actuaciones del caso</h2>
            <ButtonLink to={`/casos/${item.id}/editar?registrar-avance=1`} className="shrink-0 px-3 py-2 text-sm">+ Registrar</ButtonLink>
          </div>
          <ol className="flex-1 space-y-4 overflow-y-auto pt-4">
            {[...item.avances].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((avance) => (
              <li key={avance.id} className="border-l-4 border-forest pl-3">
                <p className="font-extrabold text-forest">{formatShortDate(avance.fecha)} · {progressLabels[avance.tipo]}</p>
                <p>{avance.descripcion}</p>
                {avance.resultado ? <p className="font-semibold">Resultado: {avance.resultado}</p> : null}
                {avance.proximaAtencion ? <p className="text-sm text-muted">Próxima atención: {formatLongDate(avance.proximaAtencion)}</p> : null}
                {avance.adjuntos?.length ? <p className="text-sm text-muted">{avance.adjuntos.length} documento(s) adjunto(s)</p> : null}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
