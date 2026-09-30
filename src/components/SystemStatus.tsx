import { Link } from 'react-router-dom'
import { Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../store/AppContext'

export function systemStatusMessage(isOnline: boolean, pendingCount: number): string {
  if (!isOnline) {
    if (pendingCount > 0) {
      return `Sin conexión · ${pendingCount} ${pendingCount === 1 ? 'cambio guardado' : 'cambios guardados'} en esta tableta.`
    }
    return 'Sin conexión · Los cambios se guardan en esta tableta.'
  }
  if (pendingCount > 0) {
    return `${pendingCount} ${pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'} de enviar al sistema.`
  }
  return 'Con conexión · Todo está guardado y sincronizado.'
}

export function SystemStatusBar({ className = '' }: { className?: string }) {
  const { isOnline, pendingCount } = useApp()
  const message = systemStatusMessage(isOnline, pendingCount)

  const boxClass = !isOnline
    ? 'border-offline bg-offline-soft text-offline'
    : pendingCount > 0
      ? 'border-pending bg-pending-soft text-pending'
      : 'border-success bg-success-soft text-success'

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-bold ${boxClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? <Wifi size={20} aria-hidden /> : <WifiOff size={20} aria-hidden />}
      <span>
        <span className="font-extrabold">Estado del sistema:</span> {message}
      </span>
      {pendingCount > 0 ? (
        <Link to="/sincronizar" className="ml-auto font-extrabold underline underline-offset-2">
          Ver sincronización
        </Link>
      ) : null}
    </div>
  )
}

/** Una línea compacta para tarjetas de acción en inicio */
export function SystemStatusMini() {
  const { isOnline, pendingCount } = useApp()
  const text = systemStatusMessage(isOnline, pendingCount)
  const textClass = !isOnline ? 'text-offline' : pendingCount > 0 ? 'text-pending' : 'text-success'

  return (
    <p className={`mt-auto w-full border-t border-line pt-3 text-center text-sm font-extrabold ${textClass}`} role="status">
      {text}
    </p>
  )
}
