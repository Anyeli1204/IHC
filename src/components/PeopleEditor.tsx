import type { Person, PersonRole } from '../types'
import { roleLabels } from '../lib/format'
import { emptyPerson } from '../lib/ids'
import { Button, Field, Select, TextInput } from './ui'

const DOC_TYPES = ['', 'DNI', 'CE', 'PASS']

export function PeopleEditor({
  people,
  onChange,
  roles,
  help,
}: {
  people: Person[]
  onChange: (people: Person[]) => void
  roles: PersonRole[]
  help?: string
}) {
  function update(index: number, patch: Partial<Person>) {
    onChange(people.map((person, i) => (i === index ? { ...person, ...patch } : person)))
  }

  return (
    <div className="space-y-5">
      {help ? <p className="text-muted">{help}</p> : null}
      {people.map((person, index) => (
        <fieldset key={person.id} className="space-y-4 rounded-2xl border border-line p-4">
          <legend className="px-2 font-extrabold">Parte {index + 1}</legend>
          <Field label="Nombres y apellidos" required htmlFor={`nombres-${person.id}`}>
            <TextInput
              id={`nombres-${person.id}`}
              value={person.nombres}
              onChange={(e) => update(index, { nombres: e.target.value })}
              autoComplete="name"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de documento" required htmlFor={`doc-${person.id}`}>
              <Select
                id={`doc-${person.id}`}
                value={person.tipoDocumento ?? ''}
                onChange={(e) => update(index, { tipoDocumento: e.target.value })}
              >
                {DOC_TYPES.map((type) => (
                  <option key={type || 'none'} value={type}>
                    {type || 'Seleccionar tipo'}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Número de documento" required htmlFor={`num-${person.id}`}>
              <TextInput
                id={`num-${person.id}`}
                value={person.numeroDocumento ?? ''}
                onChange={(e) => update(index, { numeroDocumento: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Teléfono o medio de contacto"
            optional
            hint="Si no hay teléfono, puede continuar sin este dato."
            htmlFor={`tel-${person.id}`}
          >
            <TextInput
              id={`tel-${person.id}`}
              value={person.telefono ?? ''}
              onChange={(e) => update(index, { telefono: e.target.value })}
            />
          </Field>
          <Field label="Domicilio, comunidad o localidad" required htmlFor={`com-${person.id}`}>
            <TextInput
              id={`com-${person.id}`}
              value={person.comunidad}
              onChange={(e) => update(index, { comunidad: e.target.value })}
            />
          </Field>
          <Field label="Dirección" optional htmlFor={`dir-${person.id}`}>
            <TextInput
              id={`dir-${person.id}`}
              value={person.direccion ?? ''}
              onChange={(e) => update(index, { direccion: e.target.value })}
            />
          </Field>
          <Field label="Rol de la parte" required htmlFor={`rol-${person.id}`}>
            <Select
              id={`rol-${person.id}`}
              value={person.participacion}
              onChange={(e) => update(index, { participacion: e.target.value as PersonRole })}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </Select>
          </Field>
          {people.length > 1 ? (
            <Button
              type="button"
              tone="ghost"
              onClick={() => onChange(people.filter((_, i) => i !== index))}
            >
              Quitar esta parte
            </Button>
          ) : null}
        </fieldset>
      ))}
      <Button type="button" tone="secondary" onClick={() => onChange([...people, emptyPerson(roles[0])])}>
        + Agregar otra parte
      </Button>
    </div>
  )
}

export function validatePeople(people: Person[]): string | null {
  if (people.length === 0) return 'Agregue al menos una parte involucrada.'
  const incomplete = people.find(
    (p) =>
      !p.nombres.trim() ||
      !p.tipoDocumento?.trim() ||
      !p.numeroDocumento?.trim() ||
      !p.comunidad.trim() ||
      !p.participacion,
  )
  if (incomplete) return 'Complete el nombre, la identificación, el domicilio y el rol de cada parte.'
  return null
}
