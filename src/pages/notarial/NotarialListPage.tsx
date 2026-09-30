import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatShortDate, notarialStatusLabels, notarialTypeLabel, personNames } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { Badge, ButtonLink, Card, EmptyState, FilterChip, PageHeader, TextInput } from '../../components/ui'

const filters = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'atendida', label: 'Atendidas' },
  { id: 'concluida', label: 'Concluidas' },
] as const

export function NotarialListPage() {
  const { notarials } = useApp()
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('todas')

  useEffect(() => {
    if (searchParams.get('pendientes') === '1') setFilter('pendiente')
  }, [searchParams])

  const visible = useMemo(() => {
    return notarials.filter((item) => {
      const haystack = `${item.codigo} ${item.asunto} ${item.personas.map((p) => p.nombres).join(' ')}`.toLowerCase()
      const matchesQuery = haystack.includes(query.trim().toLowerCase())
      const matchesFilter = filter === 'todas' || item.estado === filter
      return matchesQuery && matchesFilter
    })
  }, [notarials, query, filter])

  return (
    <div>
      <PageHeader
        title="Actuaciones notariales"
        subtitle="Dejar constancia y encontrar un registro."
        actions={<ButtonLink to="/actuaciones/nueva">+ Nueva actuación</ButtonLink>}
      />
      <label className="mb-4 block">
        <span className="sr-only">Buscar por nombre o código</span>
        <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o código" />
      </label>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <FilterChip
            key={item.id}
            active={filter === item.id}
            variant={item.id === 'pendiente' ? 'pending' : 'default'}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </FilterChip>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No se encontraron actuaciones" text="Pruebe con otro nombre, código o filtro." />
      ) : (
        <ul className="grid gap-4">
          {visible.map((item) => (
            <li key={item.id}>
              <Card
                className={`flex flex-row items-center justify-between gap-4 ${
                  item.estado === 'pendiente' ? 'border-2 border-warning bg-warning-soft/40' : ''
                }`}
              >
                <div>
                  <p className="font-extrabold text-forest">{item.codigo}</p>
                  <p className="text-xl font-extrabold">{notarialTypeLabel(item.tipo)}</p>
                  <p>{personNames(item.personas.map((p) => `${p.nombres} ${p.apellidos ?? ''}`.trim()))}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone={item.estado === 'pendiente' ? 'warn' : item.estado === 'concluida' ? 'ok' : 'info'}>
                      {notarialStatusLabels[item.estado]}
                    </Badge>
                    <Badge tone="neutral">{formatShortDate(item.fechaSolicitud)}</Badge>
                    {item.syncStatus === 'pending' ? <Badge tone="pending">Guardado en esta tableta</Badge> : null}
                  </div>
                </div>
                <ButtonLink to={`/actuaciones/${item.id}`} tone="secondary">
                  Ver actuación
                </ButtonLink>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
