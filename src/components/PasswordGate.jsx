import { useEffect, useState } from 'react'
import { clearPin, hasPin, isUnlocked, lock, setPin, verifyPin } from '../lib/auth'
import { LockIcon } from './Icons'

// Wraps the app behind a hashed-PIN lock screen. On first run it asks the user
// to create a PIN; afterwards it asks to enter it. Unlock lasts for the browser
// session (re-locks on tab close or via the sidebar lock button).
export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => isUnlocked())
  const [creating, setCreating] = useState(() => !hasPin())
  const [pin, setPinValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Allow the rest of the app to re-lock by dispatching `ptd:lock`.
  useEffect(() => {
    const onLock = () => {
      lock() // clear the session flag so a refresh stays locked
      setUnlocked(false)
      setCreating(!hasPin())
      setPinValue('')
      setConfirm('')
    }
    window.addEventListener('ptd:lock', onLock)
    return () => window.removeEventListener('ptd:lock', onLock)
  }, [])

  if (unlocked) return children

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{4,8}$/.test(pin)) {
      setError('PIN must be 4–8 digits.')
      return
    }
    setBusy(true)
    try {
      if (creating) {
        if (pin !== confirm) {
          setError('PINs do not match.')
          return
        }
        await setPin(pin)
        setUnlocked(true)
      } else {
        const ok = await verifyPin(pin)
        if (ok) setUnlocked(true)
        else setError('Incorrect PIN.')
      }
    } finally {
      setBusy(false)
    }
  }

  function handleForgot() {
    if (window.confirm('Reset your PIN? Your trade data stays intact — you will set a new PIN.')) {
      clearPin()
      setCreating(true)
      setPinValue('')
      setConfirm('')
      setError('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-black">
      <div className="card w-full max-w-sm p-7">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 rounded-2xl bg-brand-600 p-3 text-white">
            <LockIcon className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Preston&apos;s Trading Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {creating ? 'Create a PIN to protect your dashboard.' : 'Enter your PIN to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">{creating ? 'New PIN' : 'PIN'}</label>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-lg tracking-[0.5em]"
              placeholder="••••"
              maxLength={8}
            />
          </div>
          {creating && (
            <div>
              <label className="label">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-lg tracking-[0.5em]"
                placeholder="••••"
                maxLength={8}
              />
            </div>
          )}

          {error && <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Please wait…' : creating ? 'Set PIN & Enter' : 'Unlock'}
          </button>
        </form>

        {!creating && (
          <button onClick={handleForgot} className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            Forgot PIN? Reset it (keeps your data)
          </button>
        )}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
          This PIN is light protection for a personal device. Data is stored only in this browser.
        </p>
      </div>
    </div>
  )
}
