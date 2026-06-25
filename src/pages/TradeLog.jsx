import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Papa from 'papaparse'
import { useData } from '../context/DataContext'
import TradeForm from '../components/TradeForm'
import { Card, PageHeader, Modal, EmptyState, ConfirmButton } from '../components/ui'
import { ListIcon, PlusIcon, UploadIcon, EditIcon, ImageIcon } from '../components/Icons'
import { TAGS, TAG_STYLES } from '../lib/constants'
import { tradeBrokeRules } from '../lib/analytics'
import { signedMoney, pnlColor, num } from '../lib/format'
import { formatDateTime } from '../lib/date'

// Map a loose CSV row (any column casing) to a normalized trade.
function normalizeRow(row, instruments) {
  const low = {}
  for (const k in row) low[String(k).trim().toLowerCase()] = row[k]
  const pick = (...keys) => {
    for (const key of keys) {
      const v = low[key]
      if (v != null && String(v).trim() !== '') return v
    }
    return undefined
  }

  const instrument = String(pick('instrument', 'symbol', 'ticker', 'market', 'contract') || '').toUpperCase()
  const dirRaw = String(pick('direction', 'side', 'type', 'b/s') || 'long').toLowerCase()
  const direction = dirRaw.startsWith('s') || dirRaw.includes('sell') ? 'short' : 'long'
  const dateRaw = pick('date', 'datetime', 'time', 'entrytime', 'opened', 'entry time', 'open time')
  const date = dateRaw && !isNaN(new Date(dateRaw)) ? new Date(dateRaw) : new Date()

  const known = instruments.find((i) => i.symbol === instrument)
  const tickValue = Number(pick('tickvalue', 'tick value', 'tick_value')) || known?.tickValue || 0
  const tickSize = Number(pick('ticksize', 'tick size', 'tick_size')) || known?.tickSize || 0
  const pnlCol = pick('pnl', 'p&l', 'profit', 'realized', 'realizedpnl', 'net')

  const trade = {
    date: date.toISOString(),
    instrument,
    direction,
    contracts: Number(pick('contracts', 'qty', 'quantity', 'size', 'lots')) || 1,
    entry: Number(pick('entry', 'entryprice', 'entry price', 'open', 'price')) || 0,
    exit: Number(pick('exit', 'exitprice', 'exit price', 'close')) || 0,
    tickValue,
    tickSize,
    fees: Number(pick('fees', 'commission', 'commissions')) || 0,
  }
  // Honour an explicit realized P&L column when present.
  if (pnlCol != null && String(pnlCol).trim() !== '') {
    const v = Number(String(pnlCol).replace(/[$,()]/g, (m) => (m === '(' ? '-' : '')))
    if (Number.isFinite(v)) trade.pnlOverride = v
  }
  return trade
}

export default function TradeLog() {
  const { trades, accounts, instruments, addTrade, updateTrade, deleteTrade, importTrades, pendingChecklist, resetChecklist } =
    useData()
  const fileRef = useRef(null)
  const [editing, setEditing] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [query, setQuery] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [importMsg, setImportMsg] = useState('')

  function logNew(payload) {
    addTrade({ ...payload, checklist: { ...pendingChecklist } })
    resetChecklist()
    document.getElementById('trade-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  function saveEdit(payload) {
    updateTrade(editing.id, payload)
    setEditing(null)
  }

  function onCsv(e) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const mapped = (res.data || []).map((r) => normalizeRow(r, instruments)).filter((t) => t.instrument)
        if (!mapped.length) {
          setImportMsg('No usable rows found. Check that your CSV has an instrument/symbol column.')
          setTimeout(() => setImportMsg(''), 6000)
          return
        }
        const n = importTrades(mapped)
        setImportMsg(`Imported ${n} trade${n === 1 ? '' : 's'} from ${file.name}.`)
        setTimeout(() => setImportMsg(''), 6000)
      },
      error: () => setImportMsg('Could not parse that CSV file.'),
    })
    e.target.value = ''
  }

  function downloadTemplate() {
    const csv =
      'date,instrument,direction,contracts,entry,exit,tickValue,tickSize,fees\n' +
      `${new Date().toISOString()},ES,long,1,5000.00,5005.00,12.5,0.25,4.50\n`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trade-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const accountName = (id) => accounts.find((a) => a.id === id)?.name

  const filtered = useMemo(() => {
    return trades
      .filter((t) => (query ? t.instrument?.toLowerCase().includes(query.toLowerCase()) : true))
      .filter((t) => (tagFilter ? (t.tags || []).includes(tagFilter) : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [trades, query, tagFilter])

  return (
    <div>
      <PageHeader
        title="Trade Log"
        subtitle="Log every trade, tag your behaviour, and keep your process honest."
        actions={
          <>
            <button className="btn-ghost" onClick={downloadTemplate}>
              CSV template
            </button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <UploadIcon className="h-4 w-4" /> Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onCsv} />
          </>
        }
      />

      {importMsg && (
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-300">
          {importMsg}
        </div>
      )}

      {/* New trade */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <PlusIcon className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">New trade</h2>
        </div>
        <TradeForm onSubmit={logNew} submitLabel="Log trade" gateChecklist />
      </Card>

      {/* Filters */}
      <div id="trade-list" className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="input w-auto flex-1 sm:max-w-xs"
          placeholder="Filter by instrument…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input w-auto" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="">All tags</option>
          {TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} of {trades.length} trades
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListIcon}
          title={trades.length ? 'No trades match your filters' : 'No trades logged yet'}
          message={
            trades.length
              ? 'Try clearing the instrument or tag filter.'
              : 'Complete your pre-trade checklist, then log your first trade above — or import a CSV.'
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Instrument</th>
                  <th className="px-4 py-3 font-medium">Dir</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Entry → Exit</th>
                  <th className="px-4 py-3 text-right font-medium">P&amp;L</th>
                  <th className="px-4 py-3 font-medium">Tags / Quality</th>
                  <th className="px-4 py-3 font-medium">Rules</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="bg-white dark:bg-slate-900">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDateTime(t.date)}
                      {accountName(t.accountId) && (
                        <span className="block text-xs text-slate-400">{accountName(t.accountId)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {t.instrument}
                      {t.screenshot && (
                        <button onClick={() => setLightbox(t.screenshot)} className="ml-2 align-middle text-slate-400 hover:text-brand-500" aria-label="View chart">
                          <ImageIcon className="inline h-4 w-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={t.direction === 'short' ? 'text-rose-500' : 'text-emerald-500'}>
                        {t.direction === 'short' ? 'Short' : 'Long'}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{t.contracts}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                      {num(t.entry)} → {num(t.exit)}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${pnlColor(t.pnl)}`}>
                      {signedMoney(t.pnl)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.tags || []).map((tag) => (
                          <span key={tag} className={`chip ${TAG_STYLES[tag] || ''}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {t.quality > 0 && <div className="mt-1 text-xs text-amber-500">{'★'.repeat(t.quality)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {tradeBrokeRules(t) ? (
                        <span className="chip border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800/60 dark:bg-rose-900/20 dark:text-rose-300">
                          Broken
                        </span>
                      ) : (
                        <span className="chip border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {t.journalId && (
                          <Link to="/journal" className="rounded p-1.5 text-slate-400 hover:text-brand-500" title="Linked journal">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                        )}
                        <button onClick={() => setEditing(t)} className="rounded p-1.5 text-slate-400 hover:text-brand-500" aria-label="Edit">
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <ConfirmButton
                          className="rounded p-1.5 text-slate-400 hover:text-rose-500"
                          confirmLabel="✓?"
                          onConfirm={() => deleteTrade(t.id)}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((t) => (
              <Card key={t.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {t.instrument}{' '}
                      <span className={`text-xs font-medium ${t.direction === 'short' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {t.direction} · {t.contracts}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(t.date)}</p>
                  </div>
                  <span className={`text-lg font-bold tabular-nums ${pnlColor(t.pnl)}`}>{signedMoney(t.pnl)}</span>
                </div>
                <p className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                  {num(t.entry)} → {num(t.exit)}
                </p>
                {(t.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span key={tag} className={`chip ${TAG_STYLES[tag] || ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    {t.quality > 0 ? '★'.repeat(t.quality) : 'Unrated'} · {tradeBrokeRules(t) ? 'Rules broken' : 'Clean'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(t)} className="text-brand-600 dark:text-brand-400">
                      Edit
                    </button>
                    <ConfirmButton className="text-rose-500" confirmLabel="Sure?" onConfirm={() => deleteTrade(t.id)}>
                      Delete
                    </ConfirmButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit trade">
        {editing && <TradeForm initial={editing} onSubmit={saveEdit} submitLabel="Save changes" onCancel={() => setEditing(null)} />}
      </Modal>

      {/* Screenshot lightbox */}
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Chart screenshot" maxWidth="max-w-4xl">
        {lightbox && <img src={lightbox} alt="trade chart" className="mx-auto max-h-[70vh] rounded-lg" />}
      </Modal>
    </div>
  )
}
