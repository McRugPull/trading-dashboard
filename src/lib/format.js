// Display formatting helpers.

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function money(n) {
  const v = Number(n) || 0
  return usd.format(v)
}

export function money0(n) {
  const v = Number(n) || 0
  return usd0.format(v)
}

// "+$120.00" / "-$45.00" — useful for P&L where sign matters.
export function signedMoney(n) {
  const v = Number(n) || 0
  const s = usd.format(Math.abs(v))
  return (v > 0 ? '+' : v < 0 ? '-' : '') + s
}

export function num(n, digits = 2) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return v.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function pct(n, digits = 0) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return v.toFixed(digits) + '%'
}

// Tailwind text color class based on sign (positive green / negative red).
export function pnlColor(n) {
  const v = Number(n) || 0
  if (v > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (v < 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-500 dark:text-slate-400'
}
