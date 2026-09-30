import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router-dom'
import {
  Camera,
  Check,
  CheckCircle2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import type { NotarialAttachment, NotarialDraft, NotarialRecord, NotarialStatus, Person } from '../../types'
import { formatShortDate, notarialStatusLabels } from '../../lib/format'
import { emptyPerson, nextCode, uid } from '../../lib/ids'
import { useApp } from '../../store/AppContext'
import { BackLink } from '../../components/AppLayout'
import { Button, ButtonLink, Card, Field, Help, Modal, Select, TextArea, TextInput } from '../../components/ui'

const DOCUMENT_TYPES = ['DNI', 'CE', 'PASS']
const COUNTRY_CODES = ['+51', '+54', '+56', '+57', '+591', '+593', '+1', '+34']
const PERSON_COLORS = ['bg-sky-soft/35', 'bg-pending-soft/30', 'bg-amber-soft/35', 'bg-stone-100']

function todayLocal() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function initialDraft(codigo: string): NotarialDraft {
  return {
    codigo,
    fechaSolicitud: todayLocal(),
    fechaAtencion: '',
    tipo: '',
    asunto: '',
    estado: 'pendiente',
    observaciones: '',
    personas: [emptyPerson('declarante')],
    resultado: '',
    fechaEntrega: '',
    referenciaDocumento: '',
    adjuntos: [],
  }
}

function personIsComplete(person: Person) {
  return Boolean(
    person.nombres.trim() &&
      person.apellidos?.trim() &&
      person.tipoDocumento &&
      person.numeroDocumento?.trim() &&
      person.comunidad.trim() &&
      person.rolEnCaso?.trim(),
  )
}

function SectionTitle({
  number,
  title,
  description,
  complete,
  invalid,
}: {
  number: number
  title: string
  description: string
  complete: boolean
  invalid: boolean
}) {
  return (
    <div className="sticky -top-5 z-10 mb-5 flex items-start justify-between gap-3 border-b border-line bg-paper pb-4 pt-1">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-lg font-extrabold text-paper">
          {number}
        </span>
        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-muted">{description}</p>
        </div>
      </div>
      {complete ? (
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-success-soft px-3 py-2 font-extrabold text-success">
          <CheckCircle2 size={20} /> Completa
        </span>
      ) : invalid ? (
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-urgent-soft px-3 py-2 font-extrabold text-urgent">
          <XCircle size={20} /> Incompleta
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-cream px-3 py-2 text-sm font-bold text-muted">Por completar</span>
      )}
    </div>
  )
}

export function NotarialWizardPage() {
  const { notarials, isOnline, saveNotarial } = useApp()
  const navigate = useNavigate()
  const codigo = useMemo(() => nextCode('AN', notarials.map((item) => item.codigo)), [notarials])
  const [draft, setDraft] = useState<NotarialDraft>(() => initialDraft(codigo))
  const [submitted, setSubmitted] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [duplicate, setDuplicate] = useState<NotarialRecord | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string[]>([])
  const cameraInput = useRef<HTMLInputElement>(null)
  const documentInput = useRef<HTMLInputElement>(null)
  const firstSection = useRef<HTMLElement>(null)
  const peopleSection = useRef<HTMLElement>(null)
  const resultSection = useRef<HTMLElement>(null)
  const blocker = useBlocker(dirty && !savedId)

  useBeforeUnload((event) => {
    if (!dirty || savedId) return
    event.preventDefault()
  })

  function patch(partial: Partial<NotarialDraft>) {
    setDirty(true)
    setDraft((previous) => ({ ...previous, ...partial }))
  }

  function updatePerson(index: number, partial: Partial<Person>) {
    patch({ personas: draft.personas.map((person, itemIndex) => (itemIndex === index ? { ...person, ...partial } : person)) })
  }

  const caseComplete = Boolean(draft.fechaSolicitud && draft.tipo.trim() && draft.asunto.trim() && draft.estado)
  const peopleComplete = draft.personas.length > 0 && draft.personas.every(personIsComplete)
  const resultComplete = Boolean(draft.resultado.trim())
  const formComplete = caseComplete && peopleComplete && resultComplete

  function fieldState(value: unknown, required = true) {
    const complete = typeof value === 'string' ? Boolean(value.trim()) : Boolean(value)
    return { complete, invalid: required && submitted && !complete }
  }

  function findDuplicate() {
    const documents = draft.personas.map((person) => person.numeroDocumento?.trim()).filter(Boolean)
    return notarials.find(
      (item) =>
        item.tipo.trim().toLowerCase() === draft.tipo.trim().toLowerCase() &&
        item.fechaSolicitud === draft.fechaSolicitud &&
        item.personas.some((person) => documents.includes(person.numeroDocumento?.trim())),
    )
  }

  function validateAndSave(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!formComplete) {
      const target = !caseComplete ? firstSection : !peopleComplete ? peopleSection : resultSection
      target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const match = findDuplicate()
    if (match) {
      setDuplicate(match)
      return
    }
    saveRecord()
  }

  function saveRecord() {
    const record: NotarialRecord = {
      id: uid('an'),
      codigo: draft.codigo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending',
      fechaSolicitud: draft.fechaSolicitud,
      tipo: draft.tipo.trim(),
      asunto: draft.asunto.trim(),
      estado: draft.estado,
      observaciones: draft.observaciones.trim() || undefined,
      personas: draft.personas.map((person) => ({ ...person, nombres: person.nombres.trim(), apellidos: person.apellidos?.trim() })),
      resultado: draft.resultado.trim(),
      fechaEntrega: draft.fechaEntrega || undefined,
      referenciaDocumento: draft.referenciaDocumento.trim() || undefined,
      adjuntos: draft.adjuntos,
    }
    saveNotarial(record)
    setDirty(false)
    setDuplicate(null)
    setSavedId(record.id)
  }

  function addPerson() {
    patch({ personas: [...draft.personas, emptyPerson('declarante')] })
    window.setTimeout(() => window.scrollBy({ top: 360, behavior: 'smooth' }), 50)
  }

  function removePerson(index: number) {
    patch({ personas: draft.personas.filter((_, itemIndex) => itemIndex !== index) })
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    const batchIds = files.map(() => uid('upload'))
    setUploading((current) => [...current, ...batchIds])
    setDirty(true)
    window.setTimeout(() => {
      const attachments: NotarialAttachment[] = files.map((file, index) => ({
        id: batchIds[index],
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamano: file.size,
      }))
      setDraft((current) => ({ ...current, adjuntos: [...current.adjuntos, ...attachments] }))
      setUploading((current) => current.filter((id) => !batchIds.includes(id)))
    }, 900)
    event.target.value = ''
  }

  function removeAttachment(id: string) {
    patch({ adjuntos: draft.adjuntos.filter((file) => file.id !== id) })
  }

  if (savedId) {
    return (
      <Card className="mx-auto max-w-3xl space-y-5 text-center">
        <CheckCircle2 className="mx-auto text-success" size={64} />
        <p className="text-3xl font-extrabold text-success">Actuación guardada</p>
        <p className="text-xl font-bold">{draft.codigo}</p>
        <p>{isOnline ? 'La información quedó registrada correctamente.' : 'Se guardó en esta tableta y se sincronizará cuando vuelva la conexión.'}</p>
        <div className="flex justify-center gap-3">
          <ButtonLink to={`/actuaciones/${savedId}`}>Ver actuación</ButtonLink>
          <ButtonLink to="/actuaciones" tone="secondary">Volver a actuaciones</ButtonLink>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-0 w-full flex-col overflow-hidden">
      <BackLink to="/actuaciones">Volver a actuaciones</BackLink>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Registrar actuación notarial</h1>
          <p className="mt-1 text-muted">Complete los datos para crear un nuevo registro.</p>
        </div>
        <div className="rounded-xl border border-line bg-paper px-4 py-3 text-sm font-bold text-muted">
          <span className="text-urgent">*</span> Los campos obligatorios deben completarse
        </div>
      </div>

      <Help>Los campos completos se marcarán en verde. Si falta información al guardar, permanecerá todo lo escrito y se señalarán los campos pendientes.</Help>

      <form className="mt-3 flex min-h-0 flex-1 flex-col gap-3" onSubmit={validateAndSave} noValidate>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-5" aria-label="Secciones del registro notarial">
        <Card className={`h-full min-h-0 min-w-0 overflow-y-auto border-2 ${caseComplete ? 'border-success' : submitted ? 'border-urgent' : 'border-line'}`}>
          <section ref={firstSection} className="scroll-mt-5">
            <SectionTitle number={1} title="Información del caso" description="Datos generales de la actuación notarial." complete={caseComplete} invalid={submitted && !caseComplete} />
            <div className="grid grid-cols-1 gap-5">
              <Field label="Código o número del caso" hint="Se genera automáticamente y no puede modificarse." complete>
                <div className="relative">
                  <TextInput value={draft.codigo} readOnly aria-readonly="true" className="touch-target w-full cursor-not-allowed rounded-xl border-2 border-line bg-stone-200 px-4 pr-12 font-bold text-muted" />
                  <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                </div>
              </Field>
              <Field label="Fecha de registro" required {...fieldState(draft.fechaSolicitud)} error={submitted && !draft.fechaSolicitud ? 'Seleccione una fecha de registro.' : undefined}>
                <TextInput type="date" value={draft.fechaSolicitud} max="9999-12-31" onChange={(event) => patch({ fechaSolicitud: event.target.value })} />
              </Field>
              <Field label="Tipo de actuación notarial" required {...fieldState(draft.tipo)} error={submitted && !draft.tipo.trim() ? 'Escriba el tipo de actuación.' : undefined}>
                <TextInput value={draft.tipo} onChange={(event) => patch({ tipo: event.target.value })} placeholder="Ej.: Certificación de firma" />
              </Field>
              <Field label="Descripción breve del motivo" required {...fieldState(draft.asunto)} error={submitted && !draft.asunto.trim() ? 'Describa brevemente el motivo.' : undefined}>
                <TextArea value={draft.asunto} onChange={(event) => patch({ asunto: event.target.value })} placeholder="Explique el motivo de la actuación" />
              </Field>
              <Field label="Estado de la atención" required complete={Boolean(draft.estado)}>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Estado de la atención">
                  {(Object.keys(notarialStatusLabels) as NotarialStatus[]).map((status) => (
                    <button key={status} type="button" role="radio" aria-checked={draft.estado === status} onClick={() => patch({ estado: status })} className={`touch-target rounded-xl border-2 px-3 font-extrabold transition ${draft.estado === status ? 'border-forest bg-forest text-paper' : 'border-line bg-paper text-muted hover:border-forest'}`}>
                      {draft.estado === status ? <Check className="mr-1 inline" size={18} /> : null}{notarialStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Observaciones" optional complete={Boolean(draft.observaciones.trim())}>
                <TextArea value={draft.observaciones} onChange={(event) => patch({ observaciones: event.target.value })} placeholder="Añada alguna precisión si es necesaria" />
              </Field>
            </div>
          </section>
        </Card>

        <Card className={`h-full min-h-0 min-w-0 overflow-y-auto border-2 ${peopleComplete ? 'border-success' : submitted ? 'border-urgent' : 'border-line'}`}>
          <section ref={peopleSection} className="scroll-mt-5">
            <SectionTitle number={2} title="Partes involucradas" description="Añada a todas las personas relacionadas con el caso." complete={peopleComplete} invalid={submitted && !peopleComplete} />
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Button type="button" tone="secondary" className="min-h-16 px-6 text-lg" onClick={addPerson}>
                <Plus size={28} strokeWidth={3} /> Añadir integrante
              </Button>
              <span className="inline-flex min-h-16 items-center gap-2 rounded-xl bg-cream px-5 font-extrabold text-forest">
                <Users size={24} /> {draft.personas.length} {draft.personas.length === 1 ? 'involucrado' : 'involucrados'}
              </span>
            </div>
            <div className="space-y-5">
              {draft.personas.map((person, index) => {
                const complete = personIsComplete(person)
                return (
                  <fieldset key={person.id} className={`rounded-2xl border-2 p-5 ${complete ? 'border-success' : submitted ? 'border-urgent' : 'border-line'} ${PERSON_COLORS[index % PERSON_COLORS.length]}`}>
                    <legend className="px-3 text-xl font-extrabold">Involucrado {index + 1} {complete ? <CheckCircle2 className="ml-2 inline text-success" /> : submitted ? <XCircle className="ml-2 inline text-urgent" /> : null}</legend>
                    <div className="grid grid-cols-1 gap-5">
                      <Field label="Nombres" required {...fieldState(person.nombres)} error={submitted && !person.nombres.trim() ? 'Ingrese los nombres.' : undefined}>
                        <TextInput value={person.nombres} onChange={(event) => updatePerson(index, { nombres: event.target.value })} autoComplete="given-name" />
                      </Field>
                      <Field label="Apellidos" required {...fieldState(person.apellidos)} error={submitted && !person.apellidos?.trim() ? 'Ingrese los apellidos.' : undefined}>
                        <TextInput value={person.apellidos ?? ''} onChange={(event) => updatePerson(index, { apellidos: event.target.value })} autoComplete="family-name" />
                      </Field>
                      <Field label="Documento de identidad" required complete={Boolean(person.tipoDocumento && person.numeroDocumento?.trim())} invalid={submitted && !(person.tipoDocumento && person.numeroDocumento?.trim())} error={submitted && !(person.tipoDocumento && person.numeroDocumento?.trim()) ? 'Seleccione el tipo e ingrese el número.' : undefined}>
                        <div className="flex gap-2">
                          <Select className="touch-target w-32 rounded-xl border-2 border-line bg-paper px-3" value={person.tipoDocumento ?? ''} onChange={(event) => updatePerson(index, { tipoDocumento: event.target.value })} aria-label="Tipo de documento">
                            <option value="">Tipo</option>
                            {DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                          </Select>
                          <TextInput value={person.numeroDocumento ?? ''} onChange={(event) => updatePerson(index, { numeroDocumento: event.target.value })} placeholder="Número de documento" inputMode="numeric" />
                        </div>
                      </Field>
                      <Field label="Teléfono" optional complete={Boolean(person.telefono?.trim())} hint="Puede dejarlo vacío si no dispone del dato.">
                        <div className="flex gap-2">
                          <Select className="touch-target w-32 rounded-xl border-2 border-line bg-paper px-3" value={person.codigoPais ?? '+51'} onChange={(event) => updatePerson(index, { codigoPais: event.target.value })} aria-label="Código de país">
                            {COUNTRY_CODES.map((code) => <option key={code}>{code}</option>)}
                          </Select>
                          <TextInput type="tel" value={person.telefono ?? ''} onChange={(event) => updatePerson(index, { telefono: event.target.value })} placeholder="Número de teléfono" inputMode="tel" />
                        </div>
                      </Field>
                      <Field label="Dirección, comunidad o localidad" required {...fieldState(person.comunidad)} error={submitted && !person.comunidad.trim() ? 'Ingrese una ubicación.' : undefined}>
                        <TextInput value={person.comunidad} onChange={(event) => updatePerson(index, { comunidad: event.target.value })} placeholder="Ej.: Comunidad Santa Rosa" />
                      </Field>
                      <Field label="Rol en el caso" required {...fieldState(person.rolEnCaso)} error={submitted && !person.rolEnCaso?.trim() ? 'Indique el rol en el caso.' : undefined}>
                        <TextInput value={person.rolEnCaso ?? ''} onChange={(event) => updatePerson(index, { rolEnCaso: event.target.value })} placeholder="Ej.: Solicitante, testigo, declarante" />
                      </Field>
                    </div>
                    {draft.personas.length > 1 ? <Button type="button" tone="ghost" className="mt-4 text-urgent" onClick={() => removePerson(index)}><Trash2 size={20} /> Quitar integrante</Button> : null}
                  </fieldset>
                )
              })}
            </div>
          </section>
        </Card>

        <Card className={`h-full min-h-0 min-w-0 overflow-y-auto border-2 ${resultComplete ? 'border-success' : submitted ? 'border-urgent' : 'border-line'}`}>
          <section ref={resultSection} className="scroll-mt-5">
            <SectionTitle number={3} title="Resultados y documentación" description="Registre el resultado y adjunte los archivos de respaldo." complete={resultComplete} invalid={submitted && !resultComplete} />
            <div className="space-y-5">
              <Field label="Resultado de la actuación" required {...fieldState(draft.resultado)} error={submitted && !draft.resultado.trim() ? 'Describa el resultado de la actuación.' : undefined}>
                <TextArea value={draft.resultado} onChange={(event) => patch({ resultado: event.target.value })} placeholder="Describa el resultado obtenido" />
              </Field>
              <Field label="Fecha de entrega o conclusión" optional complete={Boolean(draft.fechaEntrega)}>
                <TextInput type="date" value={draft.fechaEntrega} onChange={(event) => patch({ fechaEntrega: event.target.value })} />
              </Field>
              <Field label="Documentos adjuntos" optional complete={draft.adjuntos.length > 0} hint="Puede tomar una foto o seleccionar uno o varios documentos.">
                <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={handleFiles} />
                <input ref={documentInput} className="sr-only" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFiles} />
                <div className="grid grid-cols-1 gap-3">
                  <Button type="button" tone="secondary" className="min-h-20 text-lg" onClick={() => cameraInput.current?.click()}><Camera size={28} /> Tomar foto</Button>
                  <Button type="button" tone="secondary" className="min-h-20 text-lg" onClick={() => documentInput.current?.click()}><FileText size={28} /> Cargar uno o varios archivos</Button>
                </div>
                {uploading.length ? <div className="mt-3 flex items-center gap-3 rounded-xl bg-info-soft p-4 font-bold text-info" role="status"><LoaderCircle className="animate-spin" /> Cargando {uploading.length} {uploading.length === 1 ? 'archivo' : 'archivos'}…</div> : null}
                {draft.adjuntos.length ? (
                  <ul className="mt-3 space-y-2" aria-label="Archivos cargados">
                    {draft.adjuntos.map((file) => (
                      <li key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3">
                        <span className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 text-forest" /><span className="truncate font-bold">{file.nombre}</span><CheckCircle2 className="shrink-0 text-success" size={20} /></span>
                        <Button type="button" tone="ghost" className="min-h-10 px-3 text-urgent" onClick={() => removeAttachment(file.id)} aria-label={`Quitar ${file.nombre}`}><Trash2 size={20} /></Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Field>
            </div>
          </section>
        </Card>
        </div>

        {submitted && !formComplete ? <div className="rounded-2xl border-2 border-urgent bg-urgent-soft px-4 py-2 font-extrabold text-urgent" role="alert"><XCircle className="mr-2 inline" />No se pudo guardar. Revise los campos obligatorios marcados en rojo; su información permanece en el formulario.</div> : null}

        <div className="z-20 flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-line bg-paper/95 p-3 shadow-xl backdrop-blur">
          <Button type="button" tone="secondary" onClick={() => navigate('/actuaciones')}>Cancelar</Button>
          <div className="flex items-center gap-4">
            <span className={`font-bold ${formComplete ? 'text-success' : 'text-muted'}`}>{formComplete ? 'Formulario completo' : 'Complete los campos obligatorios'}</span>
            <Button type="submit" className="px-8" disabled={uploading.length > 0}>Guardar actuación</Button>
          </div>
        </div>
      </form>

      {duplicate ? (
        <Modal title="Encontramos un registro parecido" onClose={() => setDuplicate(null)}>
          <p className="mb-4 text-lg">Existe una actuación similar registrada el {formatShortDate(duplicate.fechaSolicitud)}. Revísela para evitar duplicados.</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => { setDirty(false); window.setTimeout(() => navigate(`/actuaciones/${duplicate.id}`), 0) }}>Ver registro existente</Button>
            <Button tone="secondary" type="button" onClick={saveRecord}>Guardar de todos modos</Button>
          </div>
        </Modal>
      ) : null}

      {blocker.state === 'blocked' ? (
        <Modal title="¿Salir sin guardar?" onClose={() => blocker.reset()}>
          <p className="mb-5 text-lg">Tiene cambios que todavía no se han guardado. Si sale ahora, perderá la información ingresada.</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" tone="danger" onClick={() => blocker.proceed()}>Sí, salir</Button>
            <Button type="button" tone="secondary" onClick={() => blocker.reset()}>No, continuar editando</Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
