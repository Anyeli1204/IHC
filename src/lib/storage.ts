import { seedState } from '../data/seed'
import type { PersistedState } from '../types'

const KEY = 'justicia-cercana-v1'

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as PersistedState
    if (!Array.isArray(parsed.cases) || !Array.isArray(parsed.notarials) || !Array.isArray(parsed.activities)) {
      return seedState()
    }
    if ((parsed.schemaVersion ?? 1) < 2) {
      const demo = seedState()
      const existingIds = new Set(parsed.activities.map((activity) => activity.id))
      return {
        ...parsed,
        schemaVersion: 2,
        activities: [
          ...parsed.activities,
          ...demo.activities.filter((activity) => activity.id.startsWith('demo-') && !existingIds.has(activity.id)),
        ],
      }
    }
    return parsed
  } catch {
    return seedState()
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetState(): PersistedState {
  const next = seedState()
  saveState(next)
  return next
}
