import type { ActivityStatus } from '../types'

export const activityStatusColors: Record<
  ActivityStatus,
  { fill: string; border: string; label: string }
> = {
  programada: { fill: '#fef08a', border: '#ca8a04', label: 'Programada' },
  realizada: { fill: '#bbf7d0', border: '#15803d', label: 'Realizada' },
  cancelada: { fill: '#fecaca', border: '#b91c1c', label: 'Cancelada' },
}

/** Porciones de círculo: prioridad a programada (×2), resto proporcional. */
export function statusPieSlices(items: { estado: ActivityStatus }[]) {
  if (items.length === 0) return [] as { status: ActivityStatus; fraction: number }[]

  const counts: Record<ActivityStatus, number> = {
    programada: 0,
    realizada: 0,
    cancelada: 0,
  }
  for (const item of items) counts[item.estado] += 1

  const weight = (s: ActivityStatus) => (s === 'programada' ? counts[s] * 2 : counts[s])
  const total = (['programada', 'realizada', 'cancelada'] as const).reduce((sum, s) => sum + weight(s), 0)
  if (total === 0) return []

  return (['programada', 'realizada', 'cancelada'] as const)
    .filter((s) => counts[s] > 0)
    .map((status) => ({ status, fraction: weight(status) / total }))
}

export function pieGradient(slices: { status: ActivityStatus; fraction: number }[]) {
  if (slices.length === 0) return 'conic-gradient(#e7e5e4 0deg 360deg)'
  let deg = 0
  const parts: string[] = []
  for (const slice of slices) {
    const next = deg + slice.fraction * 360
    parts.push(`${activityStatusColors[slice.status].fill} ${deg}deg ${next}deg`)
    deg = next
  }
  return `conic-gradient(${parts.join(', ')})`
}
