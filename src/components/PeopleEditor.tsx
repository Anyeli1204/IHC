import { CheckCircle2, Plus, Trash2, Users, XCircle } from 'lucide-react'
import type { Person, PersonRole } from '../types'
import { roleLabels } from '../lib/format'
import { emptyPerson } from '../lib/ids'
import { Button, Field, Select, TextInput } from './ui'

const DOC_TYPES = ['DNI', 'CE', 'PASS']
const COUNTRY_CODES = ['+51', '+54', '+56', '+57', '+591', '+593', '+1', '+34']
const CARD_COLORS = ['bg-[#f5f3ff]', 'bg-[#eff6ff]', 'bg-[#fdf4ff]', 'bg-[#f8fafc]']

function isComplete(person: Person) {
  return Boolean(
    person.nombres.trim() &&
      person.apellidos?.trim() &&
      person.tipoDocumento?.trim() &&
      person.numeroDocumento?.trim() &&
      person.comunidad.trim() &&
      person.participacion,
  )
}

export function PeopleEditor({
  people,
  onChange,
  roles,
  help,
  showErrors = false,
}: {
  people: Person[]
  onChange: (people: Person[]) => void
  roles: PersonRole[]
  help?: string
  showErrors?: boolean
}) {
  function update(index: number, patch: Partial<Person>) {
    onChange(people.map((person, itemIndex) => (itemIndex === index ? { ...person, ...patch } : person)))
  }

  function filled(value?: string) {
    return Boolean(value?.trim())
  }

  return (
    <div className="space-y-5">
      {help ? <p className="text-muted">{help}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" tone="secondary" className="min-h-16 px-6 text-lg" onClick={() => onChange([...people, emptyPerson(roles[0])])}>
          <Plus size={28} strokeWidth={3} /> Añadir parte
        </Button>
        <span className="inline-flex min-h-16 items-center gap-2 rounded-xl bg-cream px-5 font-extrabold text-forest">
          <Users size={24} /> {people.length} {people.length === 1 ? 'parte registrada' : 'partes registradas'}
        </span>
      </div>

      {people.map((person, index) => {
        const complete = isComplete(person)
        return (
          <fieldset key={person.id} className={`space-y-5 rounded-2xl border-2 p-5 ${complete ? 'border-success' : showErrors ? 'border-urgent' : 'border-line'} ${CARD_COLORS[index % CARD_COLORS.length]}`}>
            <legend className="px-3 text-xl font-extrabold">
              Parte involucrada {index + 1}
              {complete ? <CheckCircle2 className="ml-2 inline text-success" /> : showErrors ? <XCircle className="ml-2 inline text-urgent" /> : null}
            </legend>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Nombres" required complete={filled(person.nombres)} invalid={showErrors && !filled(person.nombres)}>
                <TextInput value={person.nombres} onChange={(event) => update(index, { nombres: event.target.value })} autoComplete="given-name" />
              </Field>
              <Field label="Apellidos" required complete={filled(person.apellidos)} invalid={showErrors && !filled(person.apellidos)}>
                <TextInput value={person.apellidos ?? ''} onChange={(event) => update(index, { apellidos: event.target.value })} autoComplete="family-name" />
              </Field>

              <Field label="Documento de identidad" required complete={filled(person.tipoDocumento) && filled(person.numeroDocumento)} invalid={showErrors && !(filled(person.tipoDocumento) && filled(person.numeroDocumento))}>
                <div className="flex gap-2">
                  <Select className="touch-target w-32 rounded-xl border-2 border-line bg-paper px-3" value={person.tipoDocumento ?? ''} onChange={(event) => update(index, { tipoDocumento: event.target.value })} aria-label="Tipo de documento">
                    <option value="">Tipo</option>
                    {DOC_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </Select>
                  <TextInput value={person.numeroDocumento ?? ''} onChange={(event) => update(index, { numeroDocumento: event.target.value })} placeholder="Número de documento" inputMode="numeric" />
                </div>
              </Field>

              <Field label="Teléfono" optional complete={filled(person.telefono)} hint="Puede dejarlo vacío si no dispone del dato.">
                <div className="flex gap-2">
                  <Select className="touch-target w-32 rounded-xl border-2 border-line bg-paper px-3" value={person.codigoPais ?? '+51'} onChange={(event) => update(index, { codigoPais: event.target.value })} aria-label="Código de país">
                    {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
                  </Select>
                  <TextInput type="tel" value={person.telefono ?? ''} onChange={(event) => update(index, { telefono: event.target.value })} placeholder="Número de teléfono" inputMode="tel" />
                </div>
              </Field>

              <Field label="Domicilio, comunidad o localidad" required complete={filled(person.comunidad)} invalid={showErrors && !filled(person.comunidad)}>
                <TextInput value={person.comunidad} onChange={(event) => update(index, { comunidad: event.target.value })} placeholder="Ej.: Comunidad Santa Rosa" />
              </Field>
              <Field label="Rol de la parte" required complete={Boolean(person.participacion)} invalid={showErrors && !person.participacion}>
                <Select value={person.participacion} onChange={(event) => update(index, { participacion: event.target.value as PersonRole })}>
                  {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                </Select>
              </Field>
            </div>

            {people.length > 1 ? (
              <Button type="button" tone="ghost" className="text-urgent" onClick={() => onChange(people.filter((_, itemIndex) => itemIndex !== index))}>
                <Trash2 size={20} /> Quitar esta parte
              </Button>
            ) : null}
          </fieldset>
        )
      })}
    </div>
  )
}

export function validatePeople(people: Person[]): string | null {
  if (people.length === 0) return 'Agregue al menos una parte involucrada.'
  const incomplete = people.find(
    (person) =>
      !person.nombres.trim() ||
      !person.apellidos?.trim() ||
      !person.tipoDocumento?.trim() ||
      !person.numeroDocumento?.trim() ||
      !person.comunidad.trim() ||
      !person.participacion,
  )
  if (incomplete) return 'Complete nombres, apellidos, identificación, domicilio y rol de cada parte.'
  return null
}
