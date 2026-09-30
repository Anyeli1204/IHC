import { useParams } from 'react-router-dom'
import { formatLongDate, notarialStatusLabels, notarialTypeLabel, roleLabels } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { BackLink } from '../../components/AppLayout'
import { Badge, ButtonLink, Card, EmptyState } from '../../components/ui'
import { Pencil } from 'lucide-react'

export function NotarialDetailPage() {
  const { id } = useParams()
  const { notarials } = useApp()
  const item = notarials.find((record) => record.id === id)

  if (!item) {
    return <EmptyState title="No encontramos esta actuación" text="Vuelva a la lista y búsquela por nombre o código." />
  }

  const isPending = item.estado === 'pendiente'
  const panelClass = 'flex h-[calc(100vh-18rem)] min-h-[480px] flex-col overflow-hidden'

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink to="/actuaciones">Volver a actuaciones</BackLink>
        <ButtonLink to={`/actuaciones/${item.id}/editar`}><Pencil size={20} /> Editar actuación</ButtonLink>
      </div>
      <div className={`rounded-2xl border-2 bg-paper px-5 py-4 ${isPending ? 'border-warning bg-warning-soft/30' : 'border-line'}`}>
        <p className="font-extrabold text-forest">{item.codigo}</p>
        <h1 className="text-3xl font-extrabold">{notarialTypeLabel(item.tipo)}</h1>
        <p className="mt-1 text-lg">{item.asunto}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone={item.estado === 'pendiente' ? 'warn' : item.estado === 'concluida' ? 'ok' : 'info'}>
            {notarialStatusLabels[item.estado]}
          </Badge>
          {item.syncStatus === 'pending' ? <Badge tone="pending">Guardado en esta tableta</Badge> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className={panelClass}>
          <h2 className="border-b border-line pb-3 text-xl font-extrabold">Datos del acto notarial</h2>
          <div className="flex-1 space-y-4 overflow-y-auto pt-4">
            <div><p className="font-bold text-muted">Tipo de acto notarial</p><p>{notarialTypeLabel(item.tipo)}</p></div>
            <div><p className="font-bold text-muted">Fecha de solicitud</p><p>{formatLongDate(item.fechaSolicitud)}</p></div>
            <div><p className="font-bold text-muted">Lugar de atención o expedición</p><p>{item.lugarExpedicion ?? 'Santa Rosa'}</p></div>
            <div><p className="font-bold text-muted">Fecha de atención o expedición</p><p>{item.fechaAtencion ? formatLongDate(item.fechaAtencion) : 'Pendiente'}</p></div>
            <div><p className="font-bold text-muted">Descripción o asunto</p><p>{item.asunto}</p></div>
            {item.observaciones ? <div><p className="font-bold text-muted">Observaciones</p><p>{item.observaciones}</p></div> : null}
          </div>
        </Card>

        <Card className={panelClass}>
          <h2 className="border-b border-line pb-3 text-xl font-extrabold">Personas participantes</h2>
          <p className="mt-2 text-sm text-muted">Comparecientes de la actuación</p>
          <ul className="mt-3 flex-1 space-y-3 overflow-y-auto">
            {item.personas.map((person) => (
              <li key={person.id} className="rounded-xl border border-line bg-cream p-4">
                <p className="text-lg font-extrabold">{person.nombres} {person.apellidos ?? ''}</p>
                <p className="font-bold">{person.rolEnCaso || roleLabels[person.participacion]}</p>
                {person.numeroDocumento ? <p>{person.tipoDocumento}: {person.numeroDocumento}</p> : null}
                <p>{person.comunidad}</p>
                {person.telefono ? <p className="text-muted">{person.codigoPais ?? '+51'} {person.telefono}</p> : null}
                {person.actuaEnRepresentacion ? <p className="mt-2 text-sm font-bold">Representa a: {person.personaRepresentada}</p> : null}
                {person.puedeFirmar === false ? <p className="mt-2 text-sm font-bold">No puede firmar · {person.usaHuella ? 'Huella digital' : ''}{person.testigoRuego ? ' · Testigo a ruego' : ''}</p> : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card className={panelClass}>
          <h2 className="border-b border-line pb-3 text-xl font-extrabold">Resultado y registro</h2>
          <div className="flex-1 space-y-4 overflow-y-auto pt-4">
            <div><p className="font-bold text-muted">Estado de atención</p><p>{notarialStatusLabels[item.estado]}</p></div>
            <div><p className="font-bold text-muted">Resultado de la actuación</p><p>{item.resultado || 'Pendiente'}</p></div>
            <div><p className="font-bold text-muted">Fecha de entrega o conclusión</p><p>{item.fechaEntrega ? formatLongDate(item.fechaEntrega) : 'No indicada'}</p></div>
            <div><p className="font-bold text-muted">Folio / número de registro</p><p className="font-extrabold text-forest">{item.folio ? `Folio ${item.folio}` : 'Pendiente de asignación'}</p></div>
            <div><p className="font-bold text-muted">Referencia física</p><p>{item.referenciaDocumento || 'No indicada'}</p></div>
            <div>
              <p className="font-bold text-muted">Documentos adjuntos</p>
              {item.adjuntos?.length ? (
                <ul className="mt-2 space-y-2">
                  {item.adjuntos.map((file) => <li key={file.id} className="rounded-xl bg-cream px-3 py-2 font-bold">{file.nombre}</li>)}
                </ul>
              ) : <p>Sin adjuntos</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
