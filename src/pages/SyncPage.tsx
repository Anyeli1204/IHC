import { useApp } from '../store/AppContext'
import { conflictLabels, formatLongDate, notarialTypeLabel } from '../lib/format'
import { Button, ButtonLink, Card, PageHeader } from '../components/ui'

export function SyncPage() {
  const {
    isOnline,
    pendingCount,
    cases,
    notarials,
    activities,
    syncPhase,
    syncProgress,
    lastSyncAt,
    runSync,
    resetDemo,
  } = useApp()

  const pendingItems = [
    ...cases.filter((c) => c.syncStatus === 'pending').map((c) => `Caso ${c.codigo} · ${conflictLabels[c.tipoConflicto]}`),
    ...notarials.filter((n) => n.syncStatus === 'pending').map((n) => `Actuación ${n.codigo} · ${notarialTypeLabel(n.tipo)}`),
    ...activities.filter((a) => a.syncStatus === 'pending').map((a) => `Actividad · ${a.titulo}`),
  ]

  if (syncPhase === 'running') {
    const percent = Math.round((syncProgress.done / Math.max(syncProgress.total, 1)) * 100)
    return (
      <Card className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-extrabold">Sincronizando información</h1>
        <p className="text-xl">
          {syncProgress.done} de {syncProgress.total}
        </p>
        <div className="h-4 overflow-hidden rounded-full bg-line" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} role="progressbar">
          <div className="h-full bg-forest transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-muted">No cierre esta ventana.</p>
      </Card>
    )
  }

  if (syncPhase === 'success') {
    return (
      <Card className="mx-auto w-full max-w-3xl space-y-4">
        <p className="text-3xl font-extrabold text-forest">✓ Todo está sincronizado</p>
        <p>Tus cambios están actualizados.</p>
        <p className="text-muted">Última sincronización: {lastSyncAt ? '12 mayo · 4:35 p. m.' : formatLongDate('2026-05-12')}</p>
        <ButtonLink to="/">Continuar</ButtonLink>
      </Card>
    )
  }

  if (syncPhase === 'error') {
    return (
      <Card className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-extrabold">No se pudo completar la sincronización</h1>
        <p>Tus datos continúan guardados en esta tableta. No se ha perdido ninguna información.</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => runSync(false)}>
            Reintentar
          </Button>
          <ButtonLink to="/" tone="secondary">
            Seguir trabajando
          </ButtonLink>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="Sincronización"
        subtitle={
          isOnline
            ? 'Hay conexión. Puede enviar los cambios guardados en esta tableta.'
            : 'Sin conexión. Puede continuar trabajando. Los cambios se guardarán en esta tableta.'
        }
      />

      <Card>
        {pendingCount === 0 ? (
          <p className="text-lg font-bold text-forest">Todo está sincronizado.</p>
        ) : (
          <>
            <p className="mb-4 text-lg font-extrabold">
              {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'} de sincronizar
            </p>
            <ul className="mb-6 space-y-2">
              {pendingItems.map((item) => (
                <li key={item} className="rounded-xl bg-cream px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
            {isOnline ? (
              <div className="flex flex-wrap gap-3">
                <div>
                  <Button type="button" onClick={() => runSync(false)}>
                    Sincronizar ahora
                  </Button>
                  <p className="mt-2 text-base text-muted">Enviar los cambios guardados en esta tableta.</p>
                </div>
                <Button tone="secondary" type="button" onClick={() => runSync(true)}>
                  Simular error
                </Button>
              </div>
            ) : (
              <p className="rounded-xl border-2 border-offline bg-offline-soft p-4 font-extrabold text-offline">
                Cuando vuelva Internet, podrá sincronizar desde aquí o desde una computadora.
              </p>
            )}
          </>
        )}
      </Card>
      <button type="button" className="text-sm text-muted underline" onClick={resetDemo}>
        Restaurar datos de demostración
      </button>
    </div>
  )
}
