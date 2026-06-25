// Date helpers. Everything operates in the user's local timezone and keys days
// by a "YYYY-MM-DD" string so trades/journals group naturally.

export function pad(n) {
  return String(n).padStart(2, '0')
}

// Local YYYY-MM-DD (NOT UTC — toISOString would shift the day across midnight).
export function dayKey(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

export function todayKey() {
  return dayKey(new Date())
}

export function isToday(d) {
  return dayKey(d) === todayKey()
}

// Monday-based week start, returned as a day key.
export function weekKey(d = new Date()) {
  const dt = d instanceof Date ? new Date(d) : new Date(d)
  const day = (dt.getDay() + 6) % 7 // 0 = Monday
  dt.setDate(dt.getDate() - day)
  return dayKey(dt)
}

export function monthKey(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`
}

// "for input[type=datetime-local]" value from a Date.
export function toDatetimeLocal(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export function formatDate(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return '—'
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return '—'
  return dt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatLongDate(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return '—'
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function hourOfDay(d) {
  const dt = d instanceof Date ? d : new Date(d)
  return isNaN(dt) ? null : dt.getHours()
}

// Day-of-year (1..366) — used to rotate the daily quote deterministically.
export function dayOfYear(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d)
  const start = new Date(dt.getFullYear(), 0, 0)
  const diff = dt - start
  return Math.floor(diff / 86400000)
}
