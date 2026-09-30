import { useMemo, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_TODAY, type CaseDraft, type CaseRecord, type ConflictType } from '../../types'
import { conflictLabels, formatLongDate, progressLabels, roleLabels } from '../../lib/format'
import { emptyPerson, nextCode, uid } from '../../lib/ids'
import { useApp } from '../../store/AppContext'
import { PeopleEditor, validatePeople } from '../../components/PeopleEditor'
import { Button, ButtonLink, Card, Field, Help, Modal, Select, TextArea, TextInput } from '../../components/ui'

function CaseSectionTitle({ number, title, complete, invalid }: { number: number; title: string; complete: boolean; invalid: boolean }) {
  return (
    <div className="sticky -top-5 z-10 mb-5 flex items-center justify-between border-b border-line bg-paper pb-4 pt-1">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-extrabold text-paper">{number}</span>
        <h2 className="text-2xl font-extrabold">{title}</h2>
      </div>
      <span className={`rounded-full px-3 py-2 text-sm font-extrabold ${complete ? 'bg-success-soft text-success' : invalid ? 'bg-urgent-soft text-urgent' : 'bg-cream text-muted'}`}>
        {complete ? '✓ Completa' : invalid ? '✕ Incompleta' : 'Por completar'}
      </span>
    </div>
  )
}

function initialDraft(codigo: string): CaseDraft {
  return {
    codigo,
    fechaRegistro: APP_TODAY,
    lugarRegistro: 'Santa Rosa',
    tipoConflicto: '',
    motivo: '',
    estado: 'en_tramite',
    observaciones: '',
    personas: [emptyPerson('solicitante')],
    proximaAtencion: '',
    descripcionInicial: '',
    tipoActuacionInicial: 'recepcion',
    fechaActuacionInicial: APP_TODAY,
    resultadoInicial: '',
    adjuntosIniciales: [],
  }
}

export function CaseWizardPage() {
  const { cases, isOnline, saveCase } = useApp()
  const navigate = useNavigate()
  const codigo = useMemo(() => nextCode('CJ', cases.map((c) => c.codigo)), [cases])
  const [draft, setDraft] = useState<CaseDraft>(() => initialDraft(codigo))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  function patch(partial: Partial<CaseDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function validateAll() {
    setAttempted(true)
    const next: Record<string, string> = {}
    if (!draft.tipoConflicto) next.tipoConflicto = 'Seleccione la materia del caso para continuar.'
    if (!draft.motivo.trim()) next.motivo = 'Describa la controversia para continuar.'
    if (!draft.lugarRegistro.trim()) next.lugarRegistro = 'Indique el lugar donde se registra el caso.'
    if (!draft.fechaRegistro) next.fechaRegistro = 'Indique la fecha de registro.'
    const message = validatePeople(draft.personas)
    if (message) next.personas = message
    if (!draft.descripcionInicial.trim()) next.descripcionInicial = 'Describa la primera actuación judicial.'
    setErrors(next)
    if (Object.keys(next).length === 0) save()
  }

  function hasDraftContent() {
    return (
      Boolean(draft.tipoConflicto) ||
      draft.motivo.trim().length > 0 ||
      draft.lugarRegistro.trim() !== 'Santa Rosa' ||
      draft.observaciones.trim().length > 0 ||
      Boolean(draft.proximaAtencion) ||
      draft.descripcionInicial.trim().length > 0 ||
      draft.personas.some((p) => p.nombres.trim().length > 0)
    )
  }

  function requestCancel() {
    if (hasDraftContent()) setLeaveConfirm(true)
    else navigate('/casos')
  }

  function save() {
    if (saving) return
    if (!draft.descripcionInicial.trim()) {
      setErrors({ descripcionInicial: 'Describa la primera actuación judicial.' })
      return
    }
    setSaving(true)
    const record: CaseRecord = {
      id: uid('case'),
      codigo: draft.codigo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending',
      fechaRegistro: draft.fechaRegistro,
      lugarRegistro: draft.lugarRegistro.trim(),
      registradoPor: 'Juez de Paz de Santa Rosa',
      tipoConflicto: draft.tipoConflicto as ConflictType,
      motivo: draft.motivo.trim(),
      estado: draft.estado,
      observaciones: draft.observaciones.trim() || undefined,
      personas: draft.personas,
      proximaAtencion: draft.proximaAtencion || undefined,
      descripcionInicial: draft.descripcionInicial.trim() || undefined,
      avances: [
        {
          id: uid('av'),
          fecha: draft.fechaActuacionInicial,
          tipo: draft.tipoActuacionInicial,
          descripcion: draft.descripcionInicial.trim() || 'Se recibió y registró el caso.',
          resultado: draft.resultadoInicial.trim() || undefined,
          proximaAtencion: draft.proximaAtencion || undefined,
          adjuntos: draft.adjuntosIniciales,
        },
      ],
    }
    saveCase(record)
    setSavedId(record.id)
    setSaving(false)
  }

  function addInitialEvidence(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    patch({
      adjuntosIniciales: [
        ...draft.adjuntosIniciales,
        ...files.map((file) => ({
          id: uid('evidencia'),
          nombre: file.name,
          tipo: file.type || 'application/octet-stream',
          tamano: file.size,
        })),
      ],
    })
    event.target.value = ''
  }

  const dataComplete = Boolean(draft.fechaRegistro && draft.lugarRegistro.trim() && draft.tipoConflicto && draft.motivo.trim())
  const peopleComplete = !validatePeople(draft.personas)
  const actionComplete = Boolean(draft.tipoActuacionInicial && draft.fechaActuacionInicial && draft.descripcionInicial.trim())

  if (savedId) {
    return (
      <div className="w-full">
        <Card className="space-y-5">
          <p className="text-3xl font-extrabold text-forest">✓ Caso guardado</p>
          <p className="text-xl font-bold">{draft.codigo}</p>
          {isOnline ? (
            <p className="rounded-xl border-2 border-success bg-success-soft p-4 font-bold text-success">
              La información quedó registrada correctamente.
            </p>
          ) : (
            <p className="rounded-xl border-2 border-pending bg-pending-soft p-4 font-bold text-pending">
              Guardada en esta tableta. Pendiente de sincronización cuando vuelva la conexión.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={`/casos/${savedId}`}>Ver caso</ButtonLink>
            <ButtonLink to="/" tone="secondary">
              Volver al inicio
            </ButtonLink>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button type="button" tone="secondary" className="mb-4" onClick={requestCancel}>
        ← Volver a casos
      </Button>
      <h1 className="mb-2 text-3xl font-extrabold">Registrar caso judicial</h1>
      <Help>Esta ficha digital conserva la información del Libro Único de Actuaciones Judiciales.</Help>
      <form className="mt-6 space-y-6" onSubmit={(event) => { event.preventDefault(); validateAll() }} noValidate>
        <Card className={`space-y-5 border-2 ${dataComplete ? 'border-success' : attempted ? 'border-urgent' : 'border-line'}`}>
          <CaseSectionTitle number={1} title="Datos del caso" complete={dataComplete} invalid={attempted && !dataComplete} />
          <div className="grid grid-cols-2 gap-5">
          <Field label="Código del caso" hint="Numeración correlativa generada automáticamente." htmlFor="codigo">
            <TextInput id="codigo" value={draft.codigo} readOnly className="touch-target w-full cursor-not-allowed rounded-xl border-2 border-line bg-stone-200 px-4 font-bold text-muted" />
          </Field>
          <Field label="Fecha de registro" required error={errors.fechaRegistro}>
            <TextInput type="date" value={draft.fechaRegistro} onChange={(e) => patch({ fechaRegistro: e.target.value })} />
          </Field>
          <Field label="Materia" required error={errors.tipoConflicto} htmlFor="tipo" hint="Tema principal del caso. No es el tipo de actuación judicial.">
            <Select
              id="tipo"
              value={draft.tipoConflicto}
              onChange={(e) => patch({ tipoConflicto: e.target.value as ConflictType | '' })}
            >
              <option value="">Seleccionar materia</option>
              {(Object.keys(conflictLabels) as ConflictType[]).map((key) => (
                <option key={key} value={key}>
                  {conflictLabels[key]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción de la controversia" required hint="Explique qué ocurrió y qué solicitan las partes." error={errors.motivo} htmlFor="motivo">
            <TextArea id="motivo" value={draft.motivo} onChange={(e) => patch({ motivo: e.target.value })} />
          </Field>
          <Field label="Lugar donde se registra" required error={errors.lugarRegistro} htmlFor="lugar">
            <TextInput id="lugar" value={draft.lugarRegistro} onChange={(e) => patch({ lugarRegistro: e.target.value })} />
          </Field>
          <Field label="Estado del caso">
            <TextInput value="En trámite" readOnly />
          </Field>
          <Field label="Observaciones" optional htmlFor="obs">
            <TextArea id="obs" value={draft.observaciones} onChange={(e) => patch({ observaciones: e.target.value })} />
          </Field>
          </div>
        </Card>

        <Card className={`space-y-5 border-2 ${peopleComplete ? 'border-success' : attempted ? 'border-urgent' : 'border-line'}`}>
          <CaseSectionTitle number={2} title="Partes involucradas" complete={peopleComplete} invalid={attempted && !peopleComplete} />
          {errors.personas ? <p className="font-semibold text-rose">{errors.personas}</p> : null}
          <PeopleEditor
            people={draft.personas}
            onChange={(personas) => patch({ personas })}
            roles={['solicitante', 'invitado', 'testigo']}
            help="Personas que participan en el caso. El nombre, la identificación, el domicilio y el rol son obligatorios; el teléfono es opcional."
          />
        </Card>

        <Card className={`space-y-5 border-2 ${actionComplete ? 'border-success' : attempted ? 'border-urgent' : 'border-line'}`}>
          <CaseSectionTitle number={3} title="Primera actuación judicial" complete={actionComplete} invalid={attempted && !actionComplete} />
          <div className="grid grid-cols-2 gap-5">
          <Field label="Tipo de actuación judicial" required htmlFor="actuacion-tipo" hint="La materia identifica el caso; este campo identifica la actuación realizada.">
            <Select id="actuacion-tipo" value={draft.tipoActuacionInicial} onChange={(e) => patch({ tipoActuacionInicial: e.target.value as CaseDraft['tipoActuacionInicial'] })}>
              {(Object.keys(progressLabels) as CaseDraft['tipoActuacionInicial'][]).map((key) => (
                <option key={key} value={key}>{progressLabels[key]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha de la actuación" required htmlFor="actuacion-fecha">
            <TextInput id="actuacion-fecha" type="date" value={draft.fechaActuacionInicial} onChange={(e) => patch({ fechaActuacionInicial: e.target.value })} />
          </Field>
          <Field label="Descripción de la actuación" required htmlFor="desc" error={errors.descripcionInicial}>
            <TextArea id="desc" value={draft.descripcionInicial} onChange={(e) => patch({ descripcionInicial: e.target.value })} placeholder="Ej.: Se recibió la demanda presentada por la parte solicitante." />
          </Field>
          <Field label="Resultado de la actuación" optional htmlFor="resultado">
            <TextArea id="resultado" value={draft.resultadoInicial} onChange={(e) => patch({ resultadoInicial: e.target.value })} />
          </Field>
          <Field label="Documentos o evidencia" optional hint="Puede seleccionar uno o varios archivos.">
            <TextInput type="file" multiple onChange={addInitialEvidence} />
            {draft.adjuntosIniciales.length ? (
              <ul className="mt-2 space-y-1 text-sm font-bold text-forest">
                {draft.adjuntosIniciales.map((file) => <li key={file.id}>✓ {file.nombre}</li>)}
              </ul>
            ) : null}
          </Field>
          <Field label="Próxima atención" optional htmlFor="prox">
            <TextInput
              id="prox"
              type="date"
              value={draft.proximaAtencion}
              onChange={(e) => patch({ proximaAtencion: e.target.value })}
            />
          </Field>
          </div>
          <div className="rounded-xl bg-cream p-4">
            <h2 className="mb-2 text-xl font-extrabold">Revisar información</h2>
            <p>
              <strong>Materia:</strong> {draft.tipoConflicto ? conflictLabels[draft.tipoConflicto] : '—'}
            </p>
            <p>
              <strong>Controversia:</strong> {draft.motivo}
            </p>
            <p>
              <strong>Partes:</strong>{' '}
              {draft.personas.map((p) => `${p.nombres} — ${roleLabels[p.participacion]}`).join('; ')}
            </p>
            <p>
              <strong>Próxima atención:</strong>{' '}
              {draft.proximaAtencion ? formatLongDate(draft.proximaAtencion) : 'No indicada'}
            </p>
          </div>
        </Card>

        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-line bg-paper/95 p-4 shadow-xl backdrop-blur">
          <Button tone="secondary" type="button" onClick={requestCancel}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar caso judicial'}</Button>
        </div>
      </form>

      {leaveConfirm ? (
        <Modal title="¿Salir sin guardar?" onClose={() => setLeaveConfirm(false)}>
          <p className="mb-6 text-lg">
            Hay datos escritos que aún no se guardaron. Si sale ahora, perderá este borrador en pantalla.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" tone="secondary" onClick={() => setLeaveConfirm(false)}>
              Seguir registrando
            </Button>
            <Button
              type="button"
              tone="danger"
              onClick={() => {
                setLeaveConfirm(false)
                navigate('/casos')
              }}
            >
              Salir sin guardar
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
