import { useParams } from 'react-router-dom'

import { formatLongDate, notarialStatusLabels, notarialTypeLabel, roleLabels } from '../../lib/format'

import { useApp } from '../../store/AppContext'

import { BackLink } from '../../components/AppLayout'

import { Badge, Card, EmptyState } from '../../components/ui'



export function NotarialDetailPage() {

  const { id } = useParams()

  const { notarials } = useApp()

  const item = notarials.find((n) => n.id === id)



  if (!item) {

    return <EmptyState title="No encontramos esta actuación" text="Vuelva a la lista y búsquela por nombre o código." />

  }



  const isPending = item.estado === 'pendiente'



  return (

    <div className="w-full space-y-5">

      <BackLink to="/actuaciones">Volver a actuaciones</BackLink>
      <div

        className={`rounded-2xl border-2 bg-paper px-5 py-4 ${isPending ? 'border-warning bg-warning-soft/30' : 'border-line'}`}

      >

        <p className="font-extrabold text-forest">{item.codigo}</p>

        <h1 className="text-3xl font-extrabold">{notarialTypeLabel(item.tipo)}</h1>

        <div className="mt-2 flex flex-wrap gap-2">

          <Badge tone={item.estado === 'pendiente' ? 'warn' : item.estado === 'concluida' ? 'ok' : 'info'}>

            {notarialStatusLabels[item.estado]}

          </Badge>

          {item.syncStatus === 'pending' ? <Badge tone="pending">Guardado en esta tableta</Badge> : null}

        </div>

      </div>



      <div className="grid grid-cols-2 gap-5">

        <Card>

          <h2 className="mb-2 text-xl font-extrabold">Asunto</h2>

          <p className="text-lg">{item.asunto}</p>

          <p className="mt-3 font-bold text-muted">Solicitud: {formatLongDate(item.fechaSolicitud)}</p>

          {item.fechaAtencion ? <p className="font-bold text-muted">Atención: {formatLongDate(item.fechaAtencion)}</p> : null}

          {item.observaciones ? (

            <>

              <h3 className="mb-2 mt-4 font-extrabold">Observaciones</h3>

              <p>{item.observaciones}</p>

            </>

          ) : null}

        </Card>



        <Card className="flex max-h-[calc(100vh-18rem)] flex-col">

          <h2 className="mb-3 text-xl font-extrabold">Personas participantes</h2>

          <ul className="flex-1 space-y-3 overflow-y-auto">

            {item.personas.map((person) => (

              <li key={person.id} className="rounded-xl border border-line bg-cream p-4">

                <p className="text-lg font-extrabold">{person.nombres} {person.apellidos ?? ''}</p>

                <p className="font-bold">

                  {person.rolEnCaso || roleLabels[person.participacion]} · {person.comunidad}

                </p>

              </li>

            ))}

          </ul>

        </Card>

      </div>



      {item.resultado ? (

        <Card>

          <h2 className="mb-2 text-xl font-extrabold">Resultado</h2>

          <p className="text-lg">{item.resultado}</p>

          {item.fechaEntrega ? <p className="mt-2 font-bold text-muted">Entrega: {formatLongDate(item.fechaEntrega)}</p> : null}

          {item.referenciaDocumento ? <p className="font-bold text-muted">{item.referenciaDocumento}</p> : null}

          {item.adjuntos?.length ? (
            <>
              <h3 className="mb-2 mt-4 font-extrabold">Documentos adjuntos</h3>
              <ul className="space-y-2">
                {item.adjuntos.map((file) => (
                  <li key={file.id} className="rounded-xl border border-line bg-cream px-4 py-3 font-bold">
                    {file.nombre}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

        </Card>

      ) : null}

    </div>

  )

}


