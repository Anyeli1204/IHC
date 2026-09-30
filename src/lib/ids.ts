import type { Person } from '../types'

export function uid(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function nextCode(prefix: 'CJ' | 'AN', existing: string[]): string {
  const year = new Date().getFullYear()
  const nums = existing
    .map((code) => Number(code.split('-')[2]))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`
}

export function emptyPerson(role: Person['participacion'] = 'solicitante'): Person {
  return {
    id: uid('p'),
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    codigoPais: '+51',
    comunidad: '',
    direccion: '',
    participacion: role,
    rolEnCaso: '',
    actuaEnRepresentacion: false,
    personaRepresentada: '',
    documentoRepresentacion: '',
    puedeFirmar: true,
    usaHuella: false,
    testigoRuego: false,
  }
}
