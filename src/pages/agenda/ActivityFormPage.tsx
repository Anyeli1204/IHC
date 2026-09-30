import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_TODAY, type ActivityStatus, type ActivityType, type CalendarActivity } from '../../types'
import { activityStatusLabels, activityTypeLabels } from '../../lib/format'
import { uid } from '../../lib/ids'
import { useApp } from '../../store/AppContext'
import { BackLink } from '../../components/AppLayout'
import { Button, ButtonLink, Card, Field, Select, TextArea, TextInput } from '../../components/ui'

export function ActivityFormPage() {
  const { isOnline, saveActivity } = useApp()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<ActivityType | ''>('')
  const [fecha, setFecha] = useState(APP_TODAY)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaTermino, setHoraTermino] = useState('')
  const [lugar, setLugar] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState<ActivityStatus>('programada')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function submit() {
    if (saving) return
    const next: Record<string, string> = {}
    if (!titulo.trim()) next.titulo = 'Escriba el título o nombre de la actividad.'
    if (!tipo) next.tipo = 'Seleccione el tipo de actividad.'
    if (!fecha) next.fecha = 'Indique la fecha.'
    if (horaInicio && horaTermino && horaTermino <= horaInicio) {
      next.horaTermino = 'La hora de término debe ser posterior a la hora de inicio.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const record: CalendarActivity = {
      id: uid('act'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending',
      titulo: titulo.trim(),
      tipo: tipo as ActivityType,
      fecha,
      horaInicio: horaInicio || undefined,
      horaTermino: horaTermino || undefined,
      lugar: lugar.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      estado,
    }
    setSaving(true)
    saveActivity(record)
    setSaved(true)
    setSaving(false)
  }

  if (saved) {
    return (
      <div className="w-full">
        <Card className="space-y-5">
          <p className="text-3xl font-extrabold text-forest">✓ Actividad guardada</p>
          {isOnline ? (
            <p>La actividad quedó en la agenda.</p>
          ) : (
            <div className="rounded-xl border-2 border-pending bg-pending-soft p-4 font-bold text-pending">
              <p className="font-extrabold">Guardada en esta tableta.</p>
              <p>Pendiente de sincronización.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/agenda">Ver agenda</ButtonLink>
            <ButtonLink to="/" tone="secondary">
              Volver al inicio
            </ButtonLink>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5">
      <BackLink to="/agenda">Volver a la agenda</BackLink>
      <h1 className="text-3xl font-extrabold">Nueva actividad</h1>
      <Card className="space-y-5">
        <Field label="Título o nombre" required error={errors.titulo}>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>
        <Field label="Tipo de actividad" required error={errors.tipo} hint="El tipo se muestra con icono y etiqueta, no solo con color.">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as ActivityType | '')}>
            <option value="">Seleccionar tipo</option>
            {(Object.keys(activityTypeLabels) as ActivityType[]).map((key) => (
              <option key={key} value={key}>
                {activityTypeLabels[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha" required error={errors.fecha}>
          <TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hora de inicio" optional>
            <TextInput type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </Field>
          <Field label="Hora de término" optional error={errors.horaTermino}>
            <TextInput type="time" value={horaTermino} onChange={(e) => setHoraTermino(e.target.value)} />
          </Field>
        </div>
        <Field label="Lugar o comunidad" optional>
          <TextInput value={lugar} onChange={(e) => setLugar(e.target.value)} />
        </Field>
        <Field label="Descripción o motivo" optional>
          <TextArea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Field>
        <Field label="Estado" required>
          <Select value={estado} onChange={(e) => setEstado(e.target.value as ActivityStatus)}>
            {(Object.keys(activityStatusLabels) as ActivityStatus[]).map((key) => (
              <option key={key} value={key}>
                {activityStatusLabels[key]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button tone="secondary" type="button" onClick={() => navigate('/agenda')}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar actividad'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
