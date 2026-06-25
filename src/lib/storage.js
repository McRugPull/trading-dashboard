// Tiny localStorage wrapper that namespaces keys and JSON-encodes values.
// All app state flows through here so persistence is consistent and safe.

const PREFIX = 'ptd.'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.warn('storage.load failed for', key, e)
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    // Most likely a QuotaExceededError (e.g. too many large screenshots).
    console.error('storage.save failed for', key, e)
    return false
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    /* ignore */
  }
}

// Generate a reasonably-unique id without external deps.
export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase()
}
