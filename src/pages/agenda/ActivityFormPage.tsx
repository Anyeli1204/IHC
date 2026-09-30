import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { APP_TODAY, type ActivityStatus, type CalendarActivity } from '../../types'
import { activityStatusLabels } from '../../lib/format'
import { uid } from '../../lib/ids'
import { normalizeTimeInput } from '../../lib/timeGrid'
import { activityStatusColors } from '../../lib/agendaColors'
import { useApp } from '../../store/AppContext'
import { BackLink } from '../../components/AppLayout'
import { DaySchedulePicker } from '../../components/agenda/DaySchedulePicker'
import { Button, Card, Field, TextArea, TextInput } from '../../components/ui'

export function ActivityFormPage() {
  const { id } = useParams()
  const [search] = useSearchParams()
  const { isOnline, activities, saveActivity } = useApp()
  const navigate = useNavigate()

  const existing = useMemo(
    () => (id ? activities.find((a) => a.id === id) : undefined),
    [activities, id],
  )

  const [titulo, setTitulo] = useState(existing?.titulo ?? '')
  const [fecha, setFecha] = useState(existing?.fecha ?? search.get('fecha') ?? APP_TODAY)
  const [horaInicio, setHoraInicio] = useState(existing?.horaInicio ?? '09:00')
  const [horaTermino, setHoraTermino] = useState(existing?.horaTermino ?? '10:00')
  const [lugar, setLugar] = useState(existing?.lugar ?? '')
  const [descripcion, setDescripcion] = useState(existing?.descripcion ?? '')
  const [estado, setEstado] = useState<ActivityStatus>(existing?.estado ?? 'programada')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const sameDay = activities.filter((a) => a.fecha === fecha && a.id !== id)

  function submit() {
    if (saving) return
    const next: Record<string, string> = {}
    if (!titulo.trim()) next.titulo = 'Escriba el título o nombre de la actividad.'
    if (!fecha) next.fecha = 'Indique la fecha.'
    const hi = normalizeTimeInput(horaInicio)
    const ht = normalizeTimeInput(horaTermino)
    if (hi && ht && ht <= hi) {
      next.horaTermino = 'La hora de término debe ser posterior a la hora de inicio.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const record: CalendarActivity = {
      id: existing?.id ?? uid('act'),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: existing?.syncStatus ?? (isOnline ? 'synced' : 'pending'),
      titulo: titulo.trim(),
      tipo: existing?.tipo ?? 'otra',
      fecha,
      horaInicio: hi || undefined,
      horaTermino: ht || undefined,
      lugar: lugar.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      estado,
      casoCodigo: existing?.casoCodigo,
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
          <p className="text-3xl font-extrabold text-forest">✓ Evento guardado</p>
          {isOnline ? (
            <p>El evento quedó en el calendario.</p>
          ) : (
            <div className="rounded-xl border-2 border-pending bg-pending-soft p-4 font-bold text-pending">
              <p className="font-extrabold">Guardado en esta tableta.</p>
              <p>Pendiente de sincronización.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => navigate('/agenda')}>
              Ver calendario
            </Button>
            <Button type="button" tone="secondary" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5">
      <BackLink to="/agenda">Volver al calendario</BackLink>
      <h1 className="text-3xl font-extrabold">{existing ? 'Editar evento' : 'Nuevo evento'}</h1>
      <Card className="space-y-5">
        <Field label="Título o nombre de la actividad" required error={errors.titulo}>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>
        <Field label="Fecha" required error={errors.fecha}>
          <TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hora de inicio" optional>
            <TextInput
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              onBlur={() => setHoraInicio(normalizeTimeInput(horaInicio))}
              placeholder="09:00"
            />
          </Field>
          <Field label="Hora de término" optional error={errors.horaTermino}>
            <TextInput
              type="time"
              value={horaTermino}
              onChange={(e) => setHoraTermino(e.target.value)}
              onBlur={() => setHoraTermino(normalizeTimeInput(horaTermino))}
              placeholder="10:00"
            />
          </Field>
        </div>

        <DaySchedulePicker
          horaInicio={horaInicio}
          horaTermino={horaTermino}
          onChange={(start, end) => {
            setHoraInicio(start)
            setHoraTermino(end)
          }}
          otherEvents={sameDay}
          activeId={id}
          estado={estado}
        />

        <Field label="Lugar y comunidad" optional>
          <TextInput value={lugar} onChange={(e) => setLugar(e.target.value)} />
        </Field>
        <Field label="Descripción o motivo" optional>
          <TextArea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-base font-extrabold">Estado</legend>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(activityStatusLabels) as ActivityStatus[]).map((key) => {
              const colors = activityStatusColors[key]
              const active = estado === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEstado(key)}
                  className={`touch-target rounded-xl border-2 px-5 py-3 text-lg font-extrabold transition ${
                    active ? 'ring-4 ring-forest/30' : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    background: colors.fill,
                    borderColor: colors.border,
                    color: '#1c1917',
                  }}
                >
                  {activityStatusLabels[key]}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button tone="secondary" type="button" onClick={() => navigate('/agenda')}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar evento'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
