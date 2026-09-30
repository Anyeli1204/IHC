import { useNavigate } from 'react-router-dom'
import type { CalendarActivity } from '../../types'
import { activityStatusColors } from '../../lib/agendaColors'
import { activityStatusLabels, formatLongDate, formatTime } from '../../lib/format'
import { Button } from '../ui'

export function ActivityDetailModal({
  item,
  onClose,
}: {
  item: CalendarActivity
  onClose: () => void
}) {
  const navigate = useNavigate()
  const colors = activityStatusColors[item.estado]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-line bg-paper p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mb-4 rounded-xl border-2 px-4 py-3"
          style={{ background: colors.fill, borderColor: colors.border }}
        >
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">
            {activityStatusLabels[item.estado]}
          </p>
          <h2 id="activity-detail-title" className="text-2xl font-extrabold">
            {item.titulo}
          </h2>
        </div>

        <dl className="grid gap-3 text-lg">
          <Row label="Fecha" value={formatLongDate(item.fecha)} />
          <Row
            label="Horario"
            value={
              item.horaInicio
                ? `${formatTime(item.horaInicio)}${item.horaTermino ? ` — ${formatTime(item.horaTermino)}` : ''}`
                : 'Sin hora'
            }
          />
          {item.lugar ? <Row label="Lugar y comunidad" value={item.lugar} /> : null}
          {item.descripcion ? <Row label="Descripción o motivo" value={item.descripcion} /> : null}
          {item.casoCodigo ? <Row label="Caso relacionado" value={item.casoCodigo} /> : null}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" tone="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => navigate(`/agenda/${item.id}/editar`)}>
            Editar evento
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-bold text-muted">{label}</dt>
      <dd className="font-extrabold">{value}</dd>
    </div>
  )
}
