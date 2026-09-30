import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, X, XCircle } from 'lucide-react'

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger'

const tones: Record<Tone, string> = {
  primary:
    'bg-forest text-paper hover:bg-forest-dark disabled:bg-line disabled:text-muted',
  secondary:
    'bg-paper text-forest border-2 border-forest hover:bg-forest-soft disabled:border-line disabled:text-muted',
  ghost: 'bg-transparent text-forest hover:bg-forest-soft',
  danger: 'bg-urgent text-paper hover:bg-urgent/90 border-2 border-urgent',
}

export function Button({
  tone = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition ${tones[tone]} ${className}`}
      {...props}
    />
  )
}

export function ButtonLink({
  to,
  tone = 'primary',
  className = '',
  children,
}: {
  to: string
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      relative="path"
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition ${tones[tone]} ${className}`}
    >
      {children}
    </Link>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-row flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle ? <div className="mt-1 text-muted">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}

export type BadgeTone = 'neutral' | 'ok' | 'info' | 'warn' | 'urgent' | 'pending' | 'offline'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: BadgeTone
}) {
  const map: Record<BadgeTone, string> = {
    neutral: 'border-line bg-line text-ink',
    ok: 'border-success bg-success-soft text-success',
    info: 'border-info bg-info-soft text-info',
    warn: 'border-warning bg-warning-soft text-warning',
    urgent: 'border-urgent bg-urgent-soft text-urgent',
    pending: 'border-pending bg-pending-soft text-pending',
    offline: 'border-offline bg-offline-soft text-offline',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-base font-extrabold ${map[tone]}`}
    >
      {children}
    </span>
  )
}

export function AlertBanner({
  tone,
  title,
  children,
  className = '',
}: {
  tone: 'success' | 'warning' | 'urgent' | 'info' | 'pending' | 'offline'
  title?: string
  children: ReactNode
  className?: string
}) {
  const tones = {
    success: 'border-success bg-success-soft text-success',
    warning: 'border-warning bg-warning-soft text-warning',
    urgent: 'border-urgent bg-urgent-soft text-urgent',
    info: 'border-info bg-info-soft text-info',
    pending: 'border-pending bg-pending-soft text-pending',
    offline: 'border-offline bg-offline-soft text-offline',
  }
  return (
    <div className={`rounded-2xl border-2 p-5 text-lg ${tones[tone]} ${className}`} role="status">
      {title ? <p className="text-xl font-extrabold">{title}</p> : null}
      <div className={title ? 'mt-1 font-semibold' : 'font-semibold'}>{children}</div>
    </div>
  )
}

export function FilterChip({
  active,
  variant = 'default',
  children,
  onClick,
}: {
  active: boolean
  variant?: 'default' | 'urgent' | 'pending'
  children: ReactNode
  onClick: () => void
}) {
  const activeClass =
    variant === 'urgent' && active
      ? 'bg-urgent text-paper border-urgent shadow-md'
      : variant === 'pending' && active
        ? 'bg-warning text-paper border-warning shadow-md'
        : active
          ? 'bg-forest text-paper border-forest shadow-md'
          : 'bg-paper text-muted border-line hover:border-forest/40'
  return (
    <button
      type="button"
      className={`touch-target rounded-full border-2 px-5 font-extrabold transition ${activeClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-paper p-5 shadow-sm ${className}`}>{children}</section>
}

export function Field({
  label,
  hint,
  required,
  optional,
  error,
  htmlFor,
  complete,
  invalid,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  optional?: boolean
  error?: string
  htmlFor?: string
  complete?: boolean
  invalid?: boolean
  children: ReactNode
}) {
  return (
    <div className={`space-y-2 rounded-xl transition ${complete ? 'bg-success-soft/35 p-3' : invalid ? 'bg-urgent-soft/35 p-3' : ''}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="font-bold text-ink">
          {label}
        </label>
        <span className="ml-auto inline-flex items-center gap-1.5">
          {complete ? <CheckCircle2 className="text-success" size={20} aria-label="Campo completo" /> : null}
          {invalid ? <XCircle className="text-urgent" size={20} aria-label="Campo obligatorio incompleto" /> : null}
          {required ? <span className="text-sm font-extrabold text-urgent">Obligatorio</span> : null}
          {optional ? <span className="text-sm font-semibold text-muted">Opcional</span> : null}
        </span>
      </div>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {children}
      {error ? (
        <p className="text-sm font-extrabold text-urgent" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const inputClass =
  'touch-target w-full rounded-xl border-2 border-line bg-paper px-4 text-ink placeholder:text-muted/70 focus:border-forest'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-28 py-3`} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />
}

export function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="mb-6 grid grid-cols-3 gap-3" aria-label="Progreso del formulario">
      {labels.map((label, index) => {
        const current = index + 1 === step
        const done = index + 1 < step
        return (
          <li
            key={label}
            className={`rounded-xl border-2 px-4 py-3 ${
              current ? 'border-forest bg-forest-soft' : done ? 'border-forest/40 bg-paper' : 'border-line bg-paper'
            }`}
          >
            <p className="text-sm font-bold text-muted">Paso {index + 1} de {labels.length}</p>
            <p className="font-extrabold text-ink">{label}</p>
          </li>
        )
      })}
    </ol>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="text-center">
      <p className="text-xl font-extrabold">{title}</p>
      <p className="mt-2 text-muted">{text}</p>
    </Card>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-paper p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-extrabold">
            {title}
          </h2>
          {onClose ? (
            <button type="button" className="touch-target rounded-xl p-2 hover:bg-cream" onClick={onClose} aria-label="Cerrar">
              <X />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}

export function Help({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-forest-soft px-4 py-3 text-sm text-forest">{children}</p>
}
