// Simple PIN gate. The PIN is never stored — only its SHA-256 hash is kept in
// localStorage, and we compare hashes on unlock. This is light protection meant
// to keep a casual passer-by out of a personal dashboard, NOT real security
// (anyone with the device + dev tools can read localStorage).

const PIN_KEY = 'ptd.pinHash'
const SESSION_KEY = 'ptd.unlocked'

export async function hashPin(pin) {
  const data = new TextEncoder().encode(String(pin))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY)
}

export async function setPin(pin) {
  const h = await hashPin(pin)
  localStorage.setItem(PIN_KEY, h)
  sessionStorage.setItem(SESSION_KEY, '1')
}

export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const h = await hashPin(pin)
  const ok = h === stored
  if (ok) sessionStorage.setItem(SESSION_KEY, '1')
  return ok
}

export function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function lock() {
  sessionStorage.removeItem(SESSION_KEY)
}

// Wipes the PIN only (used by "forgot PIN" — keeps the user's trade data).
export function clearPin() {
  localStorage.removeItem(PIN_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}
