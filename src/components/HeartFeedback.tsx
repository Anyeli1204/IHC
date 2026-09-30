import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { trackHeartEvent, type HeartArea } from '../lib/heart'

const options = [
  { value: 1, label: 'Muy difícil' },
  { value: 2, label: 'Difícil' },
  { value: 3, label: 'Regular' },
  { value: 4, label: 'Fácil' },
  { value: 5, label: 'Muy fácil' },
]

export function HeartFeedback({ area }: { area: HeartArea }) {
  const [rating, setRating] = useState<number | null>(null)

  if (rating) {
    return (
      <div className="rounded-2xl border border-success bg-success-soft/40 p-4 text-left font-bold text-success" role="status">
        <CheckCircle2 className="mr-2 inline" size={20} /> Gracias. Su respuesta nos ayuda a mejorar el sistema.
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-line bg-cream p-4 text-left" aria-labelledby={`heart-question-${area}`}>
      <p id={`heart-question-${area}`} className="font-extrabold">¿Qué tan fácil fue completar esta tarea?</p>
      <p className="mb-3 text-sm text-muted">Seleccione una opción. No se registran datos personales.</p>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="min-h-12 rounded-xl border-2 border-line bg-paper px-2 text-sm font-bold transition hover:border-forest hover:bg-forest-soft focus-visible:border-forest"
            onClick={() => {
              setRating(option.value)
              trackHeartEvent('ease_rating', area, { rating: option.value })
            }}
          >
            <span className="block text-lg">{option.value}</span>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
