import { Navigate, useParams } from 'react-router-dom'

/** Redirige al espacio de trabajo de 3 paneles */
export function CaseEditPage() {
  const { id } = useParams()
  return <Navigate to={`/casos/${id}`} replace />
}
