import { useEffect, useState, type ChangeEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  APP_TODAY,
  COURT_NAME,
  type CaseRecord,
  type CaseStatus,
  type ConflictType,
  type Person,
  type ProgressType,
  type NotarialAttachment,
} from '../../types'
import {
  caseStatusLabels,
  conflictLabels,
  formatLongDate,
  formatShortDate,
  progressLabels,
  roleLabels,
} from '../../lib/format'
import { emptyPerson, uid } from '../../lib/ids'
import { useApp } from '../../store/AppContext'
import { validatePeople } from '../../components/PeopleEditor'
import {
  AlertBanner,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  Field,
  Modal,
  Select,
  TextArea,
  TextInput,
} from '../../components/ui'

const CONCILIATION_RESULTS = ['Acuerdo total', 'Acuerdo parcial', 'Sin acuerdo', 'Inasistencia']
const COUNTRY_CODES = ['+51', '+54', '+56', '+57', '+591', '+593', '+1', '+34']

export function CaseDetailPage({ editing = false }: { editing?: boolean }) {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { cases, saveCase, isOnline } = useApp()
  const source = cases.find((c) => c.id === id || c.codigo === id)

  const [form, setForm] = useState<CaseRecord | null>(
    source ? { ...source, lugarRegistro: source.lugarRegistro ?? 'Santa Rosa' } : null,
  )
  const [datosMsg, setDatosMsg] = useState('')
  const [personasMsg, setPersonasMsg] = useState('')
  const [avanceMsg, setAvanceMsg] = useState('')
  const [showAvanceForm, setShowAvanceForm] = useState(false)
  const [editPerson, setEditPerson] = useState<Person | null>(null)
  const [avanceFecha, setAvanceFecha] = useState(APP_TODAY)
  const [avanceTipo, setAvanceTipo] = useState<ProgressType>('citacion')
  const [avanceDesc, setAvanceDesc] = useState('')
  const [avanceResultado, setAvanceResultado] = useState('')
  const [avanceProxima, setAvanceProxima] = useState('')
  const [avanceAdjuntos, setAvanceAdjuntos] = useState<NotarialAttachment[]>([])

  useEffect(() => {
    if (source) setForm({ ...source, lugarRegistro: source.lugarRegistro ?? 'Santa Rosa' })
  }, [source])

  useEffect(() => {
    if (searchParams.get('registrar-avance') === '1') {
      setShowAvanceForm(true)
      searchParams.delete('registrar-avance')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (!source) {
    return (
      <div className="space-y-4">
        <EmptyState title="No encontramos este caso" text="Puede volver a la lista y buscarlo por nombre o código." />
        <ButtonLink to="/casos" tone="secondary">
          ← Volver a casos
        </ButtonLink>
      </div>
    )
  }

  if (!form) {
    return <p className="text-lg font-bold">Cargando caso…</p>
  }

  const current = form

  const needs =
    current.estado === 'en_tramite' && current.proximaAtencion && current.proximaAtencion <= APP_TODAY

  function persist(next: CaseRecord, message?: 'datos' | 'personas' | 'avance') {
    const record = {
      ...next,
      syncStatus: isOnline ? next.syncStatus : ('pending' as const),
    }
    saveCase(record)
    setForm(record)
    if (message === 'datos') setDatosMsg('✓ Cambios del caso guardados')
    if (message === 'personas') setPersonasMsg('✓ Partes involucradas guardadas')
    if (message === 'avance') setAvanceMsg('✓ Actuación registrada')
    window.setTimeout(() => {
      if (message === 'datos') setDatosMsg('')
      if (message === 'personas') setPersonasMsg('')
      if (message === 'avance') setAvanceMsg('')
    }, 4000)
  }

  function saveDatos() {
    if (!current.motivo.trim()) {
      setDatosMsg('Describa la controversia para guardar.')
      return
    }
    if (!current.lugarRegistro?.trim()) {
      setDatosMsg('Indique el lugar donde se registra el caso.')
      return
    }
    persist({ ...current, motivo: current.motivo.trim(), lugarRegistro: current.lugarRegistro.trim() }, 'datos')
  }

  function savePersonas() {
    const err = validatePeople(current.personas)
    if (err) {
      setPersonasMsg(err)
      return
    }
    persist(current, 'personas')
  }

  function addPerson() {
    setEditPerson(emptyPerson('solicitante'))
  }

  function saveEditedPerson() {
    if (!editPerson) return
    if (
      !editPerson.nombres.trim() ||
      !editPerson.apellidos?.trim() ||
      !editPerson.tipoDocumento?.trim() ||
      !editPerson.numeroDocumento?.trim() ||
      !editPerson.comunidad.trim()
    ) {
      return
    }
    const exists = current.personas.some((p) => p.id === editPerson.id)
    const personas = exists
      ? current.personas.map((p) => (p.id === editPerson.id ? editPerson : p))
      : [...current.personas, editPerson]
    const next = { ...current, personas }
    persist(next, 'personas')
    setEditPerson(null)
  }

  function removePerson(personId: string) {
    if (current.personas.length <= 1) {
      setPersonasMsg('Debe quedar al menos una parte involucrada en el caso.')
      return
    }
    persist({ ...current, personas: current.personas.filter((p) => p.id !== personId) }, 'personas')
  }

  function submitAvance() {
    if (!avanceDesc.trim()) {
      setAvanceMsg('Describa la actuación para guardarla.')
      return
    }
    const proxima = avanceProxima || current.proximaAtencion
    persist(
      {
        ...current,
        proximaAtencion: proxima || current.proximaAtencion,
        avances: [
          ...current.avances,
          {
            id: uid('av'),
            fecha: avanceFecha,
            tipo: avanceTipo,
            descripcion: avanceDesc.trim(),
            resultado: avanceResultado || undefined,
            proximaAtencion: avanceProxima || undefined,
            adjuntos: avanceAdjuntos,
          },
        ],
      },
      'avance',
    )
    setAvanceDesc('')
    setAvanceResultado('')
    setAvanceProxima('')
    setAvanceAdjuntos([])
    setShowAvanceForm(false)
  }

  function addEvidence(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setAvanceAdjuntos((currentFiles) => [
      ...currentFiles,
      ...files.map((file) => ({
        id: uid('evidencia'),
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamano: file.size,
      })),
    ])
    event.target.value = ''
  }

  const panelClass =
    'flex h-[calc(100vh-14rem)] min-h-[520px] flex-col rounded-2xl border-2 border-line bg-paper'

  return (
    <div className="space-y-4">
      <ButtonLink to="/casos" tone="secondary" className="text-lg">
        ← Volver a casos
      </ButtonLink>
      {editing ? <p className="rounded-xl border-2 border-info bg-info-soft px-4 py-3 font-extrabold text-info">Modo edición · Los cambios se guardan por sección.</p> : null}
      <div
        className={`rounded-2xl border-2 bg-paper px-5 py-4 ${needs ? 'border-urgent bg-urgent-soft/25' : 'border-line'}`}
      >
        <p className="text-lg font-extrabold text-forest">{form.codigo}</p>
        <h1 className="text-2xl font-extrabold">{conflictLabels[form.tipoConflicto]}</h1>
        <p className="mt-1 text-lg">{form.motivo}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={form.estado === 'concluido' ? 'ok' : 'info'}>{caseStatusLabels[form.estado]}</Badge>
          {needs ? <Badge tone="urgent">Atención: hoy</Badge> : null}
          {form.proximaAtencion && !needs ? (
            <Badge tone="warn">Próxima: {formatShortDate(form.proximaAtencion)}</Badge>
          ) : null}
          {form.syncStatus === 'pending' ? <Badge tone="pending">Sin enviar al sistema</Badge> : null}
        </div>
        <p className="mt-3 text-sm font-bold text-muted">
          {COURT_NAME} · Registrado por: {form.registradoPor ?? 'Juez de Paz responsable'}
        </p>
        {needs ? (
          <AlertBanner tone="urgent" className="mt-3 !p-4 !text-base" title="Atención requerida hoy">
            Hay una fecha programada para el {formatLongDate(form.proximaAtencion!)}. Revise las partes y registre la
            actuación correspondiente.
          </AlertBanner>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Panel 1 — Datos del caso */}
        <section className={panelClass} aria-labelledby="panel-datos">
          <div className="border-b border-line px-4 py-3">
            <h2 id="panel-datos" className="text-xl font-extrabold">
              Datos del caso
            </h2>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <Field label="Código del caso">
              <TextInput value={form.codigo} readOnly />
            </Field>
            <Field label="Fecha de registro" required>
              <TextInput type="date" value={form.fechaRegistro} onChange={(e) => setForm({ ...form, fechaRegistro: e.target.value })} />
            </Field>
            <Field label="Materia" required hint="Tema principal del caso; no es el tipo de actuación.">
              <Select
                value={form.tipoConflicto}
                onChange={(e) => setForm({ ...form, tipoConflicto: e.target.value as ConflictType })}
              >
                {(Object.keys(conflictLabels) as ConflictType[]).map((key) => (
                  <option key={key} value={key}>
                    {conflictLabels[key]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Descripción de la controversia" required hint="Explique qué ocurrió y qué solicitan las partes.">
              <TextArea value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
            </Field>
            <Field label="Lugar donde se registra" required>
              <TextInput value={form.lugarRegistro ?? 'Santa Rosa'} onChange={(e) => setForm({ ...form, lugarRegistro: e.target.value })} />
            </Field>
            <Field label="Estado del caso" required>
              <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CaseStatus })}>
                {(Object.keys(caseStatusLabels) as CaseStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {caseStatusLabels[key]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Próxima atención" optional hint="Fecha de la próxima reunión o audiencia, si corresponde.">
              <TextInput
                type="date"
                value={form.proximaAtencion ?? ''}
                onChange={(e) => setForm({ ...form, proximaAtencion: e.target.value })}
              />
            </Field>
            <Field label="Observaciones" optional>
              <TextArea
                value={form.observaciones ?? ''}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              />
            </Field>
            <Field label="Resultado final o acuerdo" optional hint="Complete cuando el caso concluya.">
              <TextArea
                value={form.resultadoFinal ?? ''}
                onChange={(e) => setForm({ ...form, resultadoFinal: e.target.value })}
              />
            </Field>
          </div>
          <div className="border-t border-line px-4 py-3">
            {datosMsg ? (
              <p className={`mb-2 font-extrabold ${datosMsg.startsWith('✓') ? 'text-success' : 'text-urgent'}`}>
                {datosMsg}
              </p>
            ) : null}
            <Button type="button" className="w-full" onClick={saveDatos}>
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* Panel 2 — Personas */}
        <section className={panelClass} aria-labelledby="panel-personas">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 id="panel-personas" className="text-xl font-extrabold">
              Partes involucradas
            </h2>
            <Button type="button" tone="secondary" className="shrink-0 text-base" onClick={addPerson}>
              + Agregar parte
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {form.personas.map((person) => (
              <article key={person.id} className="rounded-xl border border-line bg-cream p-4">
                <p className="text-lg font-extrabold">{person.nombres} {person.apellidos ?? ''}</p>
                <p className="font-bold">{person.rolEnCaso || roleLabels[person.participacion]}</p>
                {person.numeroDocumento ? (
                  <p className="text-base text-muted">{person.tipoDocumento || 'Documento'}: {person.numeroDocumento}</p>
                ) : null}
                <p className="text-base">Domicilio: {person.comunidad}</p>
                {person.telefono ? <p className="text-base text-muted">Teléfono: {person.codigoPais ?? '+51'} {person.telefono}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" tone="secondary" onClick={() => setEditPerson({ ...person })}>
                    Editar
                  </Button>
                  <Button type="button" tone="ghost" onClick={() => removePerson(person.id)}>
                    Quitar
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="border-t border-line px-4 py-3">
            {personasMsg ? (
              <p
                className={`mb-2 font-extrabold ${personasMsg.startsWith('✓') ? 'text-success' : 'text-urgent'}`}
              >
                {personasMsg}
              </p>
            ) : null}
            <Button type="button" className="w-full" tone="secondary" onClick={savePersonas}>
              Guardar partes
            </Button>
          </div>
        </section>

        {/* Panel 3 — Avances */}
        <section className={panelClass} aria-labelledby="panel-avances">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 id="panel-avances" className="text-xl font-extrabold">
              Actuaciones del caso
            </h2>
            <Button type="button" className="shrink-0 text-base" onClick={() => setShowAvanceForm((v) => !v)}>
              + Registrar actuación
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showAvanceForm ? (
              <div className="mb-4 space-y-3 rounded-xl border-2 border-forest bg-forest-soft/30 p-4">
                <p className="font-extrabold">Registrar actuación judicial</p>
                <Field label="Fecha" required>
                  <TextInput type="date" value={avanceFecha} onChange={(e) => setAvanceFecha(e.target.value)} />
                </Field>
                <Field label="Tipo de actuación" required>
                  <Select value={avanceTipo} onChange={(e) => setAvanceTipo(e.target.value as ProgressType)}>
                    {(Object.keys(progressLabels) as ProgressType[]).map((key) => (
                      <option key={key} value={key}>
                        {progressLabels[key]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Descripción de la actuación" required>
                  <TextArea value={avanceDesc} onChange={(e) => setAvanceDesc(e.target.value)} />
                </Field>
                {avanceTipo === 'conciliacion' ? (
                  <Field label="Resultado">
                    <Select value={avanceResultado} onChange={(e) => setAvanceResultado(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {CONCILIATION_RESULTS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <Field label="Resultado" optional>
                    <TextInput value={avanceResultado} onChange={(e) => setAvanceResultado(e.target.value)} />
                  </Field>
                )}
                <Field label="Próxima atención" optional>
                  <TextInput
                    type="date"
                    value={avanceProxima}
                    onChange={(e) => setAvanceProxima(e.target.value)}
                  />
                </Field>
                <Field label="Documentos o evidencia" optional hint="Puede seleccionar uno o varios archivos.">
                  <TextInput type="file" multiple onChange={addEvidence} />
                  {avanceAdjuntos.length ? (
                    <ul className="mt-2 space-y-1 text-sm font-bold text-forest">
                      {avanceAdjuntos.map((file) => <li key={file.id}>✓ {file.nombre}</li>)}
                    </ul>
                  ) : null}
                </Field>
                <div className="flex gap-2">
                  <Button type="button" tone="secondary" onClick={() => setShowAvanceForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={submitAvance}>
                    Guardar actuación
                  </Button>
                </div>
              </div>
            ) : null}

            <ol className="space-y-4">
              {[...form.avances].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((avance) => (
                <li key={avance.id} className="border-l-4 border-forest pl-3">
                  <p className="font-bold text-muted">
                    {formatShortDate(avance.fecha)} · {progressLabels[avance.tipo]}
                  </p>
                  <p className="text-base">{avance.descripcion}</p>
                  {avance.resultado ? <p className="text-base font-semibold">Resultado: {avance.resultado}</p> : null}
                  {avance.proximaAtencion ? <p className="text-base font-semibold">Próxima atención: {formatLongDate(avance.proximaAtencion)}</p> : null}
                  {avance.adjuntos?.length ? <p className="text-sm text-muted">{avance.adjuntos.length} documento(s) o evidencia adjunta</p> : null}
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-line px-4 py-3">
            {avanceMsg ? (
              <p className={`font-extrabold ${avanceMsg.startsWith('✓') ? 'text-success' : 'text-urgent'}`}>
                {avanceMsg}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {editPerson ? (
        <Modal title={form.personas.some((p) => p.id === editPerson.id) ? 'Editar parte involucrada' : 'Agregar parte involucrada'} onClose={() => setEditPerson(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombres" required>
                <TextInput value={editPerson.nombres} onChange={(e) => setEditPerson({ ...editPerson, nombres: e.target.value })} />
              </Field>
              <Field label="Apellidos" required>
                <TextInput value={editPerson.apellidos ?? ''} onChange={(e) => setEditPerson({ ...editPerson, apellidos: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de documento" required>
                <Select value={editPerson.tipoDocumento ?? ''} onChange={(e) => setEditPerson({ ...editPerson, tipoDocumento: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASS">PASS</option>
                </Select>
              </Field>
              <Field label="Número de documento" required>
                <TextInput value={editPerson.numeroDocumento ?? ''} onChange={(e) => setEditPerson({ ...editPerson, numeroDocumento: e.target.value })} />
              </Field>
            </div>
            <Field label="Domicilio, comunidad o localidad" required>
              <TextInput
                value={editPerson.comunidad}
                onChange={(e) => setEditPerson({ ...editPerson, comunidad: e.target.value })}
              />
            </Field>
            <Field label="Teléfono" optional>
              <div className="flex gap-2">
                <Select className="touch-target w-32 rounded-xl border-2 border-line bg-paper px-3" value={editPerson.codigoPais ?? '+51'} onChange={(e) => setEditPerson({ ...editPerson, codigoPais: e.target.value })} aria-label="Código de país">
                  {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
                </Select>
                <TextInput type="tel" value={editPerson.telefono ?? ''} onChange={(e) => setEditPerson({ ...editPerson, telefono: e.target.value })} />
              </div>
            </Field>
            <Field label="Rol de la parte" required>
              <Select
                value={editPerson.participacion}
                onChange={(e) =>
                  setEditPerson({ ...editPerson, participacion: e.target.value as Person['participacion'] })
                }
              >
                <option value="solicitante">Solicitante</option>
                <option value="invitado">Invitado</option>
                <option value="testigo">Testigo</option>
              </Select>
            </Field>
            <Button type="button" className="w-full" onClick={saveEditedPerson}>
              Guardar parte
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
