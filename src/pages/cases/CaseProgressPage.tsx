import { Navigate, useParams } from 'react-router-dom'

/** Redirige al panel de avances en la misma pantalla */
export function CaseProgressPage() {
  const { id } = useParams()
  return <Navigate to={`/casos/${id}/editar?registrar-avance=1`} replace />
}
