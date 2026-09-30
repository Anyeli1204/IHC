import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadState, resetState, saveState } from '../lib/storage'
import { APP_TODAY, type CalendarActivity, type CaseRecord, type NotarialRecord, type PersistedState } from '../types'

type SyncPhase = 'idle' | 'confirm' | 'running' | 'success' | 'error'

interface AppContextValue {
  cases: CaseRecord[]
  notarials: NotarialRecord[]
  activities: CalendarActivity[]
  isOnline: boolean
  lastSyncAt?: string
  pendingCount: number
  syncPhase: SyncPhase
  syncProgress: { done: number; total: number }
  showBackOnline: boolean
  setOnline: (value: boolean) => void
  saveCase: (record: CaseRecord) => void
  saveNotarial: (record: NotarialRecord) => void
  saveActivity: (record: CalendarActivity) => void
  dismissBackOnline: () => void
  startSync: () => void
  runSync: (fail?: boolean) => void
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function markPending<T extends { updatedAt: string; syncStatus: 'synced' | 'pending' }>(
  record: T,
  isOnline: boolean,
): T {
  return {
    ...record,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? record.syncStatus : 'pending',
  }
}

function pendingOf(state: PersistedState): number {
  return (
    state.cases.filter((c) => c.syncStatus === 'pending').length +
    state.notarials.filter((n) => n.syncStatus === 'pending').length +
    state.activities.filter((a) => a.syncStatus === 'pending').length
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState())
  const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle')
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 })
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const pendingCount = pendingOf(state)

  const setOnline = useCallback((value: boolean) => {
    setState((prev) => {
      const wasOffline = !prev.isOnline
      if (value && wasOffline && pendingOf(prev) > 0) {
        setShowBackOnline(true)
      }
      return { ...prev, isOnline: value }
    })
  }, [])

  const saveCase = useCallback((record: CaseRecord) => {
    setState((prev) => {
      const next = markPending(record, prev.isOnline)
      if (!prev.isOnline) next.syncStatus = 'pending'
      const exists = prev.cases.some((c) => c.id === next.id)
      return {
        ...prev,
        cases: exists ? prev.cases.map((c) => (c.id === next.id ? next : c)) : [next, ...prev.cases],
      }
    })
  }, [])

  const saveNotarial = useCallback((record: NotarialRecord) => {
    setState((prev) => {
      const next = markPending(record, prev.isOnline)
      if (!prev.isOnline) next.syncStatus = 'pending'
      const exists = prev.notarials.some((c) => c.id === next.id)
      return {
        ...prev,
        notarials: exists
          ? prev.notarials.map((c) => (c.id === next.id ? next : c))
          : [next, ...prev.notarials],
      }
    })
  }, [])

  const saveActivity = useCallback((record: CalendarActivity) => {
    setState((prev) => {
      const next = markPending(record, prev.isOnline)
      if (!prev.isOnline) next.syncStatus = 'pending'
      const exists = prev.activities.some((c) => c.id === next.id)
      return {
        ...prev,
        activities: exists
          ? prev.activities.map((c) => (c.id === next.id ? next : c))
          : [next, ...prev.activities],
      }
    })
  }, [])

  const startSync = useCallback(() => {
    setShowBackOnline(false)
    setSyncPhase('confirm')
  }, [])

  const runSync = useCallback((fail = false) => {
    const total = pendingOf(state)
    setSyncPhase('running')
    setSyncProgress({ done: 0, total: Math.max(total, 1) })

    let step = 0
    const ticks = Math.max(total, 1)
    const timer = window.setInterval(() => {
      step += 1
      setSyncProgress({ done: Math.min(step, ticks), total: ticks })
      if (step >= ticks) {
        window.clearInterval(timer)
        if (fail) {
          setSyncPhase('error')
          return
        }
        setState((prev) => ({
          ...prev,
          lastSyncAt: `${APP_TODAY}T16:35:00`,
          cases: prev.cases.map((c) => ({ ...c, syncStatus: 'synced' })),
          notarials: prev.notarials.map((n) => ({ ...n, syncStatus: 'synced' })),
          activities: prev.activities.map((a) => ({ ...a, syncStatus: 'synced' })),
        }))
        setSyncPhase('success')
      }
    }, 500)
  }, [state])

  const resetDemo = useCallback(() => {
    setState(resetState())
    setSyncPhase('idle')
    setShowBackOnline(false)
  }, [])

  const value = useMemo(
    () => ({
      cases: state.cases,
      notarials: state.notarials,
      activities: state.activities,
      isOnline: state.isOnline,
      lastSyncAt: state.lastSyncAt,
      pendingCount,
      syncPhase,
      syncProgress,
      showBackOnline,
      setOnline,
      saveCase,
      saveNotarial,
      saveActivity,
      dismissBackOnline: () => setShowBackOnline(false),
      startSync,
      runSync,
      resetDemo,
    }),
    [
      state,
      pendingCount,
      syncPhase,
      syncProgress,
      showBackOnline,
      setOnline,
      saveCase,
      saveNotarial,
      saveActivity,
      startSync,
      runSync,
      resetDemo,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
