export type HeartArea = 'general' | 'casos' | 'notarial' | 'agenda'
export type HeartEventType = 'page_view' | 'task_completed' | 'validation_error' | 'ease_rating'

export interface HeartEvent {
  id: string
  type: HeartEventType
  area: HeartArea
  createdAt: string
  path?: string
  durationMs?: number
  errorCount?: number
  rating?: number
}

interface HeartMetrics {
  firstSeenAt: string
  lastSeenAt: string
  visitDays: string[]
  events: HeartEvent[]
}

const HEART_KEY = 'justicia-cercana-heart-v1'
const MAX_EVENTS = 500

function readMetrics(): HeartMetrics {
  const now = new Date().toISOString()
  try {
    const parsed = JSON.parse(localStorage.getItem(HEART_KEY) ?? '') as HeartMetrics
    if (Array.isArray(parsed.events) && Array.isArray(parsed.visitDays)) return parsed
  } catch {
    // El primer uso todavía no tiene métricas guardadas.
  }
  return { firstSeenAt: now, lastSeenAt: now, visitDays: [], events: [] }
}

export function trackHeartEvent(
  type: HeartEventType,
  area: HeartArea,
  details: Omit<Partial<HeartEvent>, 'id' | 'type' | 'area' | 'createdAt'> = {},
) {
  const metrics = readMetrics()
  const createdAt = new Date().toISOString()
  const day = createdAt.slice(0, 10)
  const event: HeartEvent = {
    id: crypto.randomUUID(),
    type,
    area,
    createdAt,
    ...details,
  }
  const next: HeartMetrics = {
    ...metrics,
    lastSeenAt: createdAt,
    visitDays: metrics.visitDays.includes(day) ? metrics.visitDays : [...metrics.visitDays, day],
    events: [...metrics.events, event].slice(-MAX_EVENTS),
  }
  localStorage.setItem(HEART_KEY, JSON.stringify(next))
}

