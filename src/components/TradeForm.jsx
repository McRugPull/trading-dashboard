import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { calcPnl } from '../lib/pnl'
import { TAGS, TAG_STYLES, QUALITY_LABELS } from '../lib/constants'
import { toDatetimeLocal, dayKey } from '../lib/date'
import { signedMoney, pnlColor } from '../lib/format'
import { StarRating } from './ui'
import { AlertIcon, ImageIcon, XIcon } from './Icons'

function blankTrade() {
  return {
    date: toDatetimeLocal(new Date()),
    accountId: '',
    instrument: '',
    tickValue: '',
    tickSize: '',
    direction: 'long',
    contracts: 1,
    entry: '',
    exit: '',
    fees: 0,
    tags: [],
    quality: 0,
    notes: '',
    screenshot: null,
    linkJournal: false,
    rulesFollowed: true,
  }
}

// Convert a stored trade (ISO date, numbers) into editable form values.
function fromTrade(t) {
  return {
    date: toDatetimeLocal(new Date(t.date)),
    accountId: t.accountId || '',
    instrument: t.instrument || '',
    tickValue: t.tickValue ?? '',
    tickSize: t.tickSize ?? '',
    direction: t.direction || 'long',
    contracts: t.contracts ?? 1,
    entry: t.entry ?? '',
    exit: t.exit ?? '',
    fees: t.fees ?? 0,
    tags: t.tags || [],
    quality: t.quality || 0,
    notes: t.notes || '',
    screenshot: t.screenshot || null,
    linkJournal: !!t.journalId,
    rulesFollowed: t.rulesFollowed !== false,
  }
}

// Downscale an uploaded image to keep localStorage usage sane.
function resizeImage(file, maxDim = 1100, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function TradeForm({ initial, onSubmit, submitLabel = 'Log trade', gateChecklist = false, onCancel }) {
  const { instruments, accounts, addInstrument, checklistComplete } = useData()
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => (initial ? fromTrade(initial) : blankTrade()))
  const fileRef = useRef(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const pnl = useMemo(
    () =>
      calcPnl({
        direction: form.direction,
        contracts: form.contracts,
        entry: form.entry,
        exit: form.exit,
        tickValue: form.tickValue,
        tickSize: form.tickSize,
        fees: form.fees,
      }),
    [form]
  )

  const canCompute =
    form.instrument && form.entry !== '' && form.exit !== '' && form.contracts && Number(form.tickValue) > 0

  // Pick a saved instrument → auto-fill tick value & size.
  function onInstrumentChange(value) {
    const match = instruments.find((i) => i.symbol === value.toUpperCase())
    if (match) set({ instrument: match.symbol, tickValue: match.tickValue, tickSize: match.tickSize })
    else set({ instrument: value })
  }

  function toggleTag(tag) {
    set({ tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] })
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeImage(file)
      set({ screenshot: dataUrl })
    } catch {
      alert('Could not read that image.')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.instrument.trim()) return alert('Enter an instrument.')
    if (form.entry === '' || form.exit === '') return alert('Enter entry and exit prices.')
    if (gateChecklist && !checklistComplete) return

    const symbol = form.instrument.trim().toUpperCase()
    // Remember a new instrument (with its tick spec) for next time.
    if (Number(form.tickValue) > 0 && !instruments.some((i) => i.symbol === symbol)) {
      addInstrument({ symbol, tickValue: Number(form.tickValue), tickSize: Number(form.tickSize) || 0 })
    }

    const payload = {
      date: new Date(form.date).toISOString(),
      accountId: form.accountId || null,
      instrument: symbol,
      tickValue: Number(form.tickValue) || 0,
      tickSize: Number(form.tickSize) || 0,
      direction: form.direction,
      contracts: Number(form.contracts) || 0,
      entry: Number(form.entry),
      exit: Number(form.exit),
      fees: Number(form.fees) || 0,
      tags: form.tags,
      quality: form.quality,
      notes: form.notes,
      screenshot: form.screenshot,
      rulesFollowed: form.rulesFollowed,
      journalId: form.linkJournal ? dayKey(new Date(form.date)) : null,
    }
    onSubmit(payload)
    if (!isEdit) setForm(blankTrade())
  }

  const blocked = gateChecklist && !checklistComplete

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {blocked && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <span>
            Complete the{' '}
            <Link to="/checklist" className="font-semibold underline underline-offset-2">
              pre-trade checklist
            </Link>{' '}
            before logging a trade.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="label">Date &amp; time</label>
          <input
            type="datetime-local"
            className="input"
            value={form.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Account</label>
          <select className="input" value={form.accountId} onChange={(e) => set({ accountId: e.target.value })}>
            <option value="">— None —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Direction</label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
            {['long', 'short'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set({ direction: d })}
                className={`flex-1 py-2 text-sm font-semibold capitalize transition ${
                  form.direction === d
                    ? d === 'long'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                    : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Instrument</label>
          <input
            list="instrument-list"
            className="input uppercase"
            value={form.instrument}
            onChange={(e) => onInstrumentChange(e.target.value)}
            placeholder="ES, NQ, MNQ…"
          />
          <datalist id="instrument-list">
            {instruments.map((i) => (
              <option key={i.symbol} value={i.symbol}>
                {i.name}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Contracts</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input"
            value={form.contracts}
            onChange={(e) => set({ contracts: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Tick value ($)</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.tickValue}
            onChange={(e) => set({ tickValue: e.target.value })}
            placeholder="e.g. 12.5"
          />
        </div>
        <div>
          <label className="label">Tick size</label>
          <input
            type="number"
            step="0.0001"
            className="input"
            value={form.tickSize}
            onChange={(e) => set({ tickSize: e.target.value })}
            placeholder="e.g. 0.25"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Entry price</label>
          <input
            type="number"
            step="any"
            className="input"
            value={form.entry}
            onChange={(e) => set({ entry: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Exit price</label>
          <input
            type="number"
            step="any"
            className="input"
            value={form.exit}
            onChange={(e) => set({ exit: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Fees ($)</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.fees}
            onChange={(e) => set({ fees: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Calculated P&amp;L</label>
          <div
            className={`input flex items-center font-bold tabular-nums ${
              canCompute ? pnlColor(pnl) : 'text-slate-400'
            }`}
          >
            {canCompute ? signedMoney(pnl) : '—'}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const active = form.tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`chip ${
                  active ? TAG_STYLES[tag] : 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rules followed */}
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <input
          type="checkbox"
          checked={form.rulesFollowed}
          onChange={(e) => set({ rulesFollowed: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-100">I followed my rules on this trade</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Uncheck for an undisciplined trade (counts against your streak).
          </span>
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Trade quality</label>
          <div className="flex items-center gap-3">
            <StarRating value={form.quality} onChange={(q) => set({ quality: q })} />
            <span className="text-sm text-slate-500 dark:text-slate-400">{QUALITY_LABELS[form.quality] || 'Unrated'}</span>
          </div>
        </div>
        <div>
          <label className="label">Chart screenshot</label>
          {form.screenshot ? (
            <div className="relative inline-block">
              <img src={form.screenshot} alt="chart" className="h-20 rounded-lg border border-slate-200 dark:border-slate-700" />
              <button
                type="button"
                onClick={() => set({ screenshot: null })}
                className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow"
                aria-label="Remove screenshot"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ghost"
            >
              <ImageIcon className="h-4 w-4" /> Upload chart
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input min-h-[80px] resize-y"
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="What was the setup and how did it play out?"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={form.linkJournal}
          onChange={(e) => set({ linkJournal: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        Link this trade to the journal for {dayKey(new Date(form.date))}
      </label>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={blocked}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
