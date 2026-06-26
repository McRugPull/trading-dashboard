import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Card, PageHeader, EmptyState } from '../components/ui'
import { BookIcon } from '../components/Icons'
import { dayKey, weekKey, monthKey, formatDate, formatLongDate } from '../lib/date'

const TABS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

// Prompted fields per journal kind.
const FIELDS = {
  daily: [
    { key: 'morningPlan', title: 'Morning plan', prompt: 'What is your bias, your A+ setups, and your hard no-trade zones today?' },
    { key: 'eodRecap', title: 'End-of-day recap', prompt: 'How did you execute vs. the plan? What did you do well or poorly?' },
    { key: 'lessons', title: 'Lessons / notes', prompt: 'One concrete thing to repeat and one to fix tomorrow.' },
  ],
  weekly: [
    { key: 'summary', title: 'Week summary', prompt: 'How did the week go overall — process, discipline, and results?' },
    { key: 'wins', title: 'Wins', prompt: 'What went well that you want to keep doing?' },
    { key: 'improvements', title: 'Improvements', prompt: 'What patterns hurt you, and what is the fix?' },
    { key: 'focus', title: 'Next week focus', prompt: 'The single most important thing to work on next week.' },
  ],
  monthly: [
    { key: 'review', title: 'Monthly review', prompt: 'Big picture: are you growing as a trader? What does the data say?' },
    { key: 'biggestWin', title: 'Biggest win', prompt: 'Your best decision or trade this month — and why it worked.' },
    { key: 'biggestMistake', title: 'Biggest mistake', prompt: 'Your costliest mistake — and the rule that prevents it.' },
    { key: 'goals', title: 'Goals for next month', prompt: 'Specific, measurable goals (process-based, not just P&L).' },
  ],
}

function entryHasContent(entry, kind) {
  return FIELDS[kind].some((f) => (entry?.[f.key] || '').trim())
}
function entrySnippet(entry, kind) {
  for (const f of FIELDS[kind]) {
    const v = (entry?.[f.key] || '').trim()
    if (v) return v
  }
  return ''
}
function periodLabel(kind, key) {
  if (kind === 'daily') return formatDate(key)
  if (kind === 'weekly') return `Week of ${formatDate(key)}`
  const d = new Date(key + '-01')
  return isNaN(d) ? key : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function Journal() {
  const { journal, getJournal, saveJournal } = useData()
  const [params] = useSearchParams()

  // Deep-link support: /journal?tab=daily&date=YYYY-MM-DD (from the Calendar / Trade Log)
  const initTab = params.get('tab')
  const initDate = params.get('date')
  const [tab, setTab] = useState(() => (TABS.some((t) => t.id === initTab) ? initTab : 'daily'))
  const [date, setDate] = useState(() => (initDate && /^\d{4}-\d{2}-\d{2}$/.test(initDate) ? initDate : dayKey()))
  const [month, setMonth] = useState(() =>
    initDate && /^\d{4}-\d{2}$/.test(initDate) ? initDate : initDate && /^\d{4}-\d{2}-\d{2}$/.test(initDate) ? initDate.slice(0, 7) : monthKey()
  )
  const [form, setForm] = useState({})
  const [savedAt, setSavedAt] = useState(null)

  const periodKey = useMemo(() => {
    if (tab === 'daily') return dayKey(date)
    if (tab === 'weekly') return weekKey(date)
    return month
  }, [tab, date, month])

  // Load the stored entry whenever the selected period or tab changes.
  useEffect(() => {
    const entry = getJournal(tab, periodKey) || {}
    setForm(entry)
    setSavedAt(entry.updatedAt || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, periodKey])

  function save() {
    saveJournal(tab, periodKey, form)
    setSavedAt(new Date().toISOString())
  }

  // Jump to a past entry (from the history list).
  function openEntry(kind, key) {
    setTab(kind)
    if (kind === 'monthly') setMonth(key)
    else setDate(key)
  }

  // Past entries of the current kind, newest first.
  const history = useMemo(() => {
    const bucket = journal[tab] || {}
    return Object.entries(bucket)
      .filter(([, v]) => entryHasContent(v, tab))
      .map(([key, v]) => ({ key, snippet: entrySnippet(v, tab), updatedAt: v.updatedAt }))
      .sort((a, b) => (a.key < b.key ? 1 : -1))
  }, [journal, tab])

  const fields = FIELDS[tab]
  const wordCount = fields.reduce((n, f) => n + (form[f.key]?.trim().split(/\s+/).filter(Boolean).length || 0), 0)

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="Plan in the morning, recap at the close, zoom out weekly and monthly."
        actions={
          <button className="btn-primary" onClick={save}>
            Save entry
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <Card className="mb-5">
            <div className="flex flex-wrap items-center gap-4">
              {tab !== 'monthly' ? (
                <div>
                  <label className="label">{tab === 'weekly' ? 'Pick any day in the week' : 'Date'}</label>
                  <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              ) : (
                <div>
                  <label className="label">Month</label>
                  <input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
              )}
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {tab === 'daily' && <span>{formatLongDate(date)}</span>}
                {tab === 'weekly' && <span>Week of {formatDate(weekKey(date))}</span>}
                {tab === 'monthly' && <span>{periodLabel('monthly', month)}</span>}
              </div>
              <div className="ml-auto text-xs text-slate-400">
                {savedAt ? `Saved · ${new Date(savedAt).toLocaleString()}` : 'Not saved yet'} · {wordCount} words
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <Card key={f.key}>
                <label className="mb-1 block font-semibold text-slate-900 dark:text-white">{f.title}</label>
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{f.prompt}</p>
                <textarea
                  className="input min-h-[140px] resize-y leading-relaxed"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  onBlur={save}
                  placeholder="Write here…"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Past entries */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <BookIcon className="h-4 w-4" /> Past {tab} entries
          </h2>
          {history.length === 0 ? (
            <EmptyState icon={BookIcon} title="No saved entries yet" message={`Your past ${tab} journals will appear here as you write them.`} />
          ) : (
            <div className="space-y-2">
              {history.map((h) => {
                const active = h.key === periodKey
                return (
                  <button
                    key={h.key}
                    onClick={() => openEntry(tab, h.key)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/20'
                        : 'border-slate-200 bg-white hover:border-brand-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-700'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{periodLabel(tab, h.key)}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{h.snippet}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
