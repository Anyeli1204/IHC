import { useApp } from '../store/AppContext'
import { SystemStatusBar } from './SystemStatus'

export type SafetyContext = 'general' | 'form' | 'save' | 'sync' | 'list'

function safetyCopy(context: SafetyContext, isOnline: boolean, pendingCount: number) {
  const recoveryOffline =
    'Sus datos siguen en esta tableta. Cuando haya internet, abra Sincronizar y use Reintentar si hace falta.'
  const recoveryFormCancel = 'Si cancela, no se guarda el borrador. Puede volver a registrar cuando quiera.'

  switch (context) {
    case 'form':
      return {
        prevention: 'Complete los campos obligatorios antes de continuar. Use Atrás para corregir un paso.',
        recovery: !isOnline
          ? `Al guardar sin conexión, el registro queda en la tableta. ${recoveryOffline}`
          : `Si falta un dato, verá un aviso en rojo. ${recoveryFormCancel}`,
      }
    case 'save':
      return {
        prevention: 'Revise la información antes de Guardar. En detalle de caso, guarde cada panel por separado.',
        recovery: !isOnline
          ? recoveryOffline
          : 'Si el guardado falla, corrija lo indicado en rojo y vuelva a pulsar Guardar. Nada se pierde.',
      }
    case 'sync':
      return {
        prevention: 'No cierre esta ventana mientras sincroniza.',
        recovery: 'Si falla la sincronización, pulse Reintentar. Todos los registros permanecen en la tableta.',
      }
    case 'list':
      return {
        prevention: 'Use la búsqueda y los filtros para encontrar un registro.',
        recovery: 'Si no encuentra un caso, pruebe otro nombre o código. Puede volver al inicio sin perder lo guardado.',
      }
    default:
      return {
        prevention: 'Lea los avisos de color: indican urgencia, pendientes o sin conexión.',
        recovery:
          !isOnline || pendingCount > 0
            ? recoveryOffline
            : 'Use Volver o toque Justicia Cercana arriba para cambiar de pantalla con seguridad.',
      }
  }
}

export function ActionSafetyBar({
  context = 'general',
  className = '',
}: {
  context?: SafetyContext
  className?: string
}) {
  const { isOnline, pendingCount } = useApp()
  const { prevention, recovery } = safetyCopy(context, isOnline, pendingCount)

  return (
    <div
      className={`rounded-xl border-2 border-info bg-info-soft px-4 py-3 text-base text-info ${className}`}
      role="note"
      aria-label="Recuperación y prevención de errores"
    >
      <p className="font-extrabold">Recuperación y prevención</p>
      <p className="mt-1 font-semibold">
        <span className="font-extrabold">Prevención:</span> {prevention}
      </p>
      <p className="mt-1 font-semibold">
        <span className="font-extrabold">Si algo falla:</span> {recovery}
      </p>
    </div>
  )
}

/** Estado del sistema + recuperación/prevenión (junto a acciones) */
export function ActionContextBars({
  context = 'general',
  className = '',
  showSystem = true,
  showSafety = true,
}: {
  context?: SafetyContext
  className?: string
  showSystem?: boolean
  showSafety?: boolean
}) {
  if (!showSystem && !showSafety) return null
  return (
    <div className={`space-y-2 ${className}`}>
      {showSystem ? <SystemStatusBar /> : null}
      {showSafety ? <ActionSafetyBar context={context} /> : null}
    </div>
  )
}

/** Una línea para tarjetas de acción en inicio */
export function ActionSafetyMini() {
  return (
    <p className="mt-1 w-full text-center text-xs font-bold text-info" role="note">
      Revise antes de guardar · Si hay error en rojo, corríjalo y reintente
    </p>
  )
}
