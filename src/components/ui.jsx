import { useEffect, useState } from 'react'
import { XIcon } from './Icons'

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`card p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${className}`}>
      {children}
    </h2>
  )
}

export function StatCard({ label, value, sub, icon: Icon, valueClassName = '' }) {
  return (
    <Card className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-1 truncate text-2xl font-bold tabular-nums ${valueClassName || 'text-slate-900 dark:text-white'}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {Icon && (
        <span className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </span>
      )}
    </Card>
  )
}

// Progress meter that shifts colour as it fills (green → amber → red).
export function Meter({ value, max = 100, label, valueLabel, dangerHigh = true }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  let bar = 'bg-emerald-500'
  if (dangerHigh) {
    if (pct >= 80) bar = 'bg-rose-500'
    else if (pct >= 50) bar = 'bg-amber-500'
  } else {
    if (pct <= 20) bar = 'bg-rose-500'
    else if (pct <= 50) bar = 'bg-amber-500'
  }
  return (
    <div>
      {(label || valueLabel) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
          <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">{valueLabel}</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-neutral-700">
      {Icon && (
        <span className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400 dark:bg-neutral-800 dark:text-slate-500">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div
        className={`card my-6 w-full ${maxWidth} animate-[fadeIn_.12s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

// Click-to-confirm destructive button (two-tap delete; no window.confirm).
export function ConfirmButton({ onConfirm, children = 'Delete', className = 'btn-danger', confirmLabel = 'Sure?' }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 2500)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <button
      className={className}
      onClick={() => {
        if (armed) {
          onConfirm?.()
          setArmed(false)
        } else setArmed(true)
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  )
}

export function StarRating({ value = 0, onChange, size = 'h-6 w-6' }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={`${size} transition ${n <= value ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300 dark:text-slate-600'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
