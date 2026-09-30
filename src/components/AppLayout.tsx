import { Link, Outlet, useNavigate } from 'react-router-dom'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { AlertBanner, Button, Modal } from './ui'
import { COURT_NAME } from '../types'

export function AppLayout() {
  const { isOnline, pendingCount, setOnline, showBackOnline, runSync, dismissBackOnline } = useApp()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-paper focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="flex w-full items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0">
            <Link to="/" className="block rounded-lg hover:opacity-90">
              <p className="text-xl font-extrabold text-forest">Justicia Cercana</p>
              <p className="truncate text-base text-muted">{COURT_NAME}</p>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-base font-extrabold ${
                isOnline ? 'border-success bg-success-soft text-success' : 'border-offline bg-offline-soft text-offline'
              }`}
              role="status"
            >
              {isOnline ? <Wifi size={20} aria-hidden /> : <WifiOff size={20} aria-hidden />}
              <span>{isOnline ? 'Con conexión' : 'Sin conexión'}</span>
            </div>
            <button
              type="button"
              className="touch-target rounded-xl border border-line px-3 text-sm font-semibold text-muted hover:bg-cream"
              onClick={() => setOnline(!isOnline)}
              title="Solo para demostración del examen"
            >
              {isOnline ? 'Simular sin conexión' : 'Simular conexión'}
            </button>
          </div>
        </div>
        {pendingCount > 0 ? (
          <div className="border-t-2 border-pending bg-pending-soft">
            <div className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-3">
              <p className="text-base font-extrabold text-pending">
                {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'} pendientes de enviar al sistema · Sincronización pendiente
              </p>
              <Button
                className="shrink-0"
                onClick={() => {
                  if (isOnline) runSync(false)
                  navigate('/sincronizar')
                }}
              >
                <RefreshCw size={18} />
                {isOnline ? 'Sincronizar ahora' : 'Ver estado'}
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main id="contenido" className="w-full flex-1 px-6 py-5">
        <Outlet />
      </main>

      {showBackOnline ? (
        <Modal title="Internet disponible" onClose={dismissBackOnline}>
          <p className="mb-6 text-lg">
            Tienes {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'} pendientes de enviar al sistema. Tus datos ya
            están guardados en esta tableta.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                navigate('/sincronizar')
                runSync(false)
              }}
            >
              Sincronizar ahora
            </Button>
            <Button tone="secondary" onClick={dismissBackOnline}>
              Más tarde
            </Button>
          </div>
          <p className="mt-4 text-base text-muted">Enviar los cambios guardados en esta tableta.</p>
        </Modal>
      ) : null}
    </div>
  )
}

export function SavedBanner({ online }: { online: boolean }) {
  if (online) {
    return (
      <AlertBanner tone="success" title="✓ Guardado correctamente">
        La información quedó registrada.
      </AlertBanner>
    )
  }
  return (
    <AlertBanner tone="pending" title="✓ Guardado en esta tableta">
      Pendiente de sincronización. Podrás enviar los cambios cuando vuelva la conexión.
    </AlertBanner>
  )
}

export function BackLink({ to, children }: { to: string; children: string }) {
  const navigate = useNavigate()
  return (
    <Button type="button" tone="secondary" className="mb-4" onClick={() => navigate(to)}>
      ← {children}
    </Button>
  )
}
