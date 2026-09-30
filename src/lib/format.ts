import type {
  ActivityStatus,
  ActivityType,
  CaseStatus,
  ConflictType,
  NotarialStatus,
  NotarialType,
  PersonRole,
  ProgressType,
  SyncStatus,
} from '../types'
import { APP_TODAY } from '../types'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatLongDate(value: string): string {
  const date = parseISODate(value)
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`
}

export function formatShortDate(value: string): string {
  const date = parseISODate(value)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatWeekdayDate(value: string): string {
  const date = parseISODate(value)
  const weekday = WEEKDAYS[date.getDay()]
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${date.getDate()} de ${MONTHS[date.getMonth()]}`
}

export function formatMonthYear(year: number, monthIndex: number): string {
  const name = MONTHS[monthIndex]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

export function formatTime(value?: string): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const suffix = h >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

export function greetingForToday(): string {
  return 'Buenos días'
}

export function todayLabel(): string {
  return formatWeekdayDate(APP_TODAY)
}

export const conflictLabels: Record<ConflictType, string> = {
  vecinal: 'Asuntos vecinales o comunales',
  familiar: 'Asuntos familiares',
  patrimonial: 'Obligaciones y asuntos patrimoniales',
  otro: 'Otro derecho de libre disponibilidad',
}

export const caseStatusLabels: Record<CaseStatus, string> = {
  en_tramite: 'En trámite',
  concluido: 'Concluido',
}

export const roleLabels: Record<PersonRole, string> = {
  solicitante: 'Solicitante',
  invitado: 'Invitado',
  testigo: 'Testigo',
  declarante: 'Declarante',
}

export const progressLabels: Record<ProgressType, string> = {
  recepcion: 'Recepción del caso',
  demanda: 'Demanda verbal o escrita',
  contestacion: 'Contestación',
  denuncia: 'Denuncia',
  citacion: 'Citación',
  audiencia: 'Audiencia',
  conciliacion: 'Conciliación',
  constatacion: 'Constatación',
  reunion: 'Reunión',
  otro: 'Otra actuación',
}

export const notarialTypeLabels: Record<NotarialType, string> = {
  constancia: 'Constancia',
  certificacion_firma: 'Certificación de firma',
  certificacion_copia: 'Certificación de copia',
  certificacion_libro: 'Certificación de libro de actas',
  transferencia_posesoria: 'Transferencia posesoria',
  otra: 'Otra actuación',
}

export function notarialTypeLabel(value: string): string {
  return notarialTypeLabels[value as NotarialType] ?? value
}

export const notarialStatusLabels: Record<NotarialStatus, string> = {
  pendiente: 'Pendiente',
  atendida: 'Atendida',
  concluida: 'Concluida',
}

export const activityTypeLabels: Record<ActivityType, string> = {
  audiencia: 'Audiencia',
  reunion: 'Reunión',
  visita: 'Visita',
  atencion: 'Atención',
  otra: 'Otra',
}

export const activityStatusLabels: Record<ActivityStatus, string> = {
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

export const activityIcons: Record<ActivityType, string> = {
  audiencia: '⚖',
  reunion: '👥',
  visita: '📍',
  atencion: '🖐',
  otra: '📌',
}

export function syncLabel(status: SyncStatus): string {
  return status === 'pending' ? 'Pendiente de sincronización' : 'Sincronizado'
}

export function personNames(names: string[]): string {
  if (names.length === 0) return 'Sin personas registradas'
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} — ${names[1]}`
  return `${names[0]} y ${names.length - 1} más`
}
