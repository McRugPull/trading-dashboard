import { useEffect, useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { Card, PageHeader } from '../components/ui'
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

export default function Journal() {
  const { getJournal, saveJournal } = useData()
  const [tab, setTab] = useState('daily')
  // A date drives daily & weekly; a month string drives monthly.
  const [date, setDate] = useState(() => dayKey())
  const [month, setMonth] = useState(() => monthKey())
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
      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
            {tab === 'monthly' && <span>{new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
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
  )
}
