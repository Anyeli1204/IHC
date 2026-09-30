import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { APP_TODAY } from '../../types'
import {
  caseStatusLabels,
  conflictLabels,
  formatShortDate,
  personNames,
} from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { Badge, ButtonLink, Card, EmptyState, FilterChip, PageHeader, TextInput } from '../../components/ui'

const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'en_tramite', label: 'En trámite' },
  { id: 'concluido', label: 'Concluidos' },
  { id: 'atencion', label: 'Requieren atención' },
] as const

export function CaseListPage() {
  const { cases } = useApp()
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('todos')

  useEffect(() => {
    if (searchParams.get('requieren-atencion') === '1') setFilter('atencion')
  }, [searchParams])

  const visible = useMemo(() => {
    return cases.filter((item) => {
      const haystack = `${item.codigo} ${conflictLabels[item.tipoConflicto]} ${item.motivo} ${item.lugarRegistro ?? ''} ${item.personas.map((p) => `${p.nombres} ${p.apellidos ?? ''} ${p.numeroDocumento ?? ''}`).join(' ')}`.toLowerCase()
      const matchesQuery = haystack.includes(query.trim().toLowerCase())
      const needs = item.estado === 'en_tramite' && item.proximaAtencion && item.proximaAtencion <= APP_TODAY
      const matchesFilter =
        filter === 'todos' ||
        (filter === 'en_tramite' && item.estado === 'en_tramite') ||
        (filter === 'concluido' && item.estado === 'concluido') ||
        (filter === 'atencion' && needs)
      return matchesQuery && matchesFilter
    })
  }, [cases, query, filter])

  return (
    <div>
      <PageHeader
        title="Casos judiciales"
        subtitle="Ficha digital del Libro Único de Actuaciones Judiciales."
        actions={<ButtonLink to="/casos/nuevo">+ Nuevo caso</ButtonLink>}
      />

      <label className="mb-4 block">
        <span className="sr-only">Buscar por parte, código o controversia</span>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por parte, código o controversia"
        />
      </label>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtros de casos">
        {filters.map((item) => (
          <FilterChip
            key={item.id}
            active={filter === item.id}
            variant={item.id === 'atencion' ? 'urgent' : 'default'}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No se encontraron casos" text="Pruebe con otro nombre, código o filtro." />
      ) : (
        <ul className="grid gap-4">
          {visible.map((item) => {
            const needs = item.estado === 'en_tramite' && item.proximaAtencion && item.proximaAtencion <= APP_TODAY
            return (
              <li key={item.id}>
                <Card
                  className={`flex flex-row items-center justify-between gap-4 ${
                    needs ? 'border-2 border-urgent bg-urgent-soft/30' : ''
                  }`}
                >
                  <div>
                    <p className="font-extrabold text-forest">{item.codigo}</p>
                    <p className="text-xl font-extrabold">{conflictLabels[item.tipoConflicto]}</p>
                    <p>{personNames(item.personas.map((p) => `${p.nombres} ${p.apellidos ?? ''}`.trim()))}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={item.estado === 'concluido' ? 'ok' : 'info'}>
                        {caseStatusLabels[item.estado]}
                      </Badge>
                      {needs ? <Badge tone="urgent">⚠ Requiere atención hoy</Badge> : null}
                      {item.proximaAtencion && !needs ? (
                        <Badge tone="warn">Próxima atención: {formatShortDate(item.proximaAtencion)}</Badge>
                      ) : null}
                      {item.syncStatus === 'pending' ? <Badge tone="pending">Guardado en esta tableta</Badge> : null}
                    </div>
                  </div>
                  <ButtonLink to={`/casos/${item.id}`} tone="secondary">
                    Ver caso
                  </ButtonLink>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
