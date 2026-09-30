export const APP_TODAY = (() => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
})()
export const COURT_NAME = 'Juzgado de Paz de Santa Rosa'

export type SyncStatus = 'synced' | 'pending'
export type CaseStatus = 'en_tramite' | 'concluido'
export type ConflictType = 'vecinal' | 'familiar' | 'patrimonial' | 'otro'
export type PersonRole = 'solicitante' | 'invitado' | 'testigo' | 'declarante'
export type ProgressType =
  | 'recepcion'
  | 'demanda'
  | 'contestacion'
  | 'denuncia'
  | 'citacion'
  | 'audiencia'
  | 'conciliacion'
  | 'constatacion'
  | 'reunion'
  | 'otro'
export type ConciliationResult =
  | 'acuerdo_total'
  | 'acuerdo_parcial'
  | 'sin_acuerdo'
  | 'inasistencia'
export type NotarialType =
  | 'constancia'
  | 'certificacion_firma'
  | 'certificacion_copia'
  | 'certificacion_libro'
  | 'transferencia_posesoria'
  | 'otra'
export type NotarialStatus = 'pendiente' | 'atendida' | 'concluida'
export type ActivityType = 'audiencia' | 'reunion' | 'visita' | 'atencion' | 'otra'
export type ActivityStatus = 'programada' | 'realizada' | 'cancelada'

export interface Person {
  id: string
  nombres: string
  apellidos?: string
  tipoDocumento?: string
  numeroDocumento?: string
  codigoPais?: string
  telefono?: string
  comunidad: string
  direccion?: string
  participacion: PersonRole
  rolEnCaso?: string
}

export interface NotarialAttachment {
  id: string
  nombre: string
  tipo: string
  tamano: number
}

export interface CaseProgress {
  id: string
  fecha: string
  tipo: ProgressType
  descripcion: string
  resultado?: string
  proximaAtencion?: string
  adjuntos?: NotarialAttachment[]
}

export interface CaseRecord {
  id: string
  codigo: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  fechaRegistro: string
  lugarRegistro?: string
  registradoPor?: string
  tipoConflicto: ConflictType
  motivo: string
  estado: CaseStatus
  observaciones?: string
  personas: Person[]
  proximaAtencion?: string
  descripcionInicial?: string
  avances: CaseProgress[]
  resultadoFinal?: string
}

export interface NotarialRecord {
  id: string
  codigo: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  fechaSolicitud: string
  fechaAtencion?: string
  tipo: string
  asunto: string
  estado: NotarialStatus
  observaciones?: string
  personas: Person[]
  resultado?: string
  fechaEntrega?: string
  referenciaDocumento?: string
  adjuntos?: NotarialAttachment[]
}

export interface CalendarActivity {
  id: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  titulo: string
  tipo: ActivityType
  fecha: string
  horaInicio?: string
  horaTermino?: string
  lugar?: string
  descripcion?: string
  estado: ActivityStatus
  casoCodigo?: string
}

export interface PersistedState {
  cases: CaseRecord[]
  notarials: NotarialRecord[]
  activities: CalendarActivity[]
  isOnline: boolean
  lastSyncAt?: string
}

export interface CaseDraft {
  codigo: string
  fechaRegistro: string
  lugarRegistro: string
  tipoConflicto: ConflictType | ''
  motivo: string
  estado: CaseStatus
  observaciones: string
  personas: Person[]
  proximaAtencion: string
  descripcionInicial: string
  tipoActuacionInicial: ProgressType
  fechaActuacionInicial: string
  resultadoInicial: string
  adjuntosIniciales: NotarialAttachment[]
}

export interface NotarialDraft {
  codigo: string
  fechaSolicitud: string
  fechaAtencion: string
  tipo: string
  asunto: string
  estado: NotarialStatus
  observaciones: string
  personas: Person[]
  resultado: string
  fechaEntrega: string
  referenciaDocumento: string
  adjuntos: NotarialAttachment[]
}
