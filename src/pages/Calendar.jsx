import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { dailyStats } from '../lib/analytics'
import { Card, PageHeader, Modal, StatCard } from '../components/ui'
import { signedMoney, money0, pnlColor, pct } from '../lib/format'
import { pad, dayKey, formatDateTime, formatLongDate } from '../lib/date'
import { TAG_STYLES } from '../lib/constants'
import { CalendarIcon, ChartIcon, BookIcon } from '../components/Icons'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const { trades, accounts } = useData()
  const now = new Date()
  const [cursor, setCursor] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }))
  const [selected, setSelected] = useState(null) // 'YYYY-MM-DD'

  const stats = useMemo(() => dailyStats(trades), [trades])
  const { y, m } = cursor
  const todayKeyStr = dayKey(now)

  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthPrefix = `${y}-${pad(m + 1)}-`
  const monthDays = Object.values(stats).filter((s) => s.date.startsWith(monthPrefix))
  const monthPnl = monthDays.reduce((a, s) => a + s.pnl, 0)
  const monthTrades = monthDays.reduce((a, s) => a + s.count, 0)
  const winDays = monthDays.filter((s) => s.pnl > 0).length
  const lossDays = monthDays.filter((s) => s.pnl < 0).length
  const greenRate = winDays + lossDays ? (winDays / (winDays + lossDays)) * 100 : 0

  const prev = () => setCursor((c) => { const d = new Date(c.y, c.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const next = () => setCursor((c) => { const d = new Date(c.y, c.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const goToday = () => setCursor({ y: now.getFullYear(), m: now.getMonth() })

  const accountName = (id) => accounts.find((a) => a.id === id)?.name
  const selectedTrades = selected
    ? trades.filter((t) => dayKey(t.date) === selected).sort((a, b) => new Date(a.date) - new Date(b.date))
    : []
  const selectedStat = selected ? stats[selected] : null
  const monthLabel = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Your daily P&L at a glance. Click any day to see its trades."
        actions={
          <div className="flex items-center gap-1">
            <button className="btn-ghost px-3" onClick={prev} aria-label="Previous month">‹</button>
            <button className="btn-ghost" onClick={goToday}>Today</button>
            <button className="btn-ghost px-3" onClick={next} aria-label="Next month">›</button>
          </div>
        }
      />

      {/* Month summary */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`${monthLabel} P&L`} value={signedMoney(monthPnl)} valueClassName={pnlColor(monthPnl)} sub={`${monthTrades} trades`} icon={ChartIcon} />
        <StatCard label="Green days" value={winDays} sub={`${lossDays} red days`} valueClassName="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Green-day rate" value={pct(greenRate)} sub="of days with trades" />
        <StatCard label="Trading days" value={monthDays.length} sub="days you took trades" icon={CalendarIcon} />
      </div>

      <Card className="p-3 sm:p-4">
        <div className="mb-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{monthLabel}</div>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day == null) return <div key={`b${i}`} />
            const key = `${y}-${pad(m + 1)}-${pad(day)}`
            const s = stats[key]
            const isToday = key === todayKeyStr
            let tone = 'border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900'
            if (s && s.pnl > 0) tone = 'border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25'
            else if (s && s.pnl < 0) tone = 'border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25'
            else if (s) tone = 'border-slate-300 bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800'
            const Comp = s ? 'button' : 'div'
            return (
              <Comp
                key={key}
                onClick={s ? () => setSelected(key) : undefined}
                className={`relative flex min-h-[58px] flex-col rounded-lg border p-1.5 text-left transition sm:min-h-[76px] ${tone} ${
                  isToday ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-black' : ''
                }`}
              >
                <span className={`text-[11px] font-medium ${s ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                  {day}
                </span>
                {s && (
                  <span className="mt-auto">
                    <span className={`block text-xs font-bold tabular-nums sm:text-sm ${pnlColor(s.pnl)}`}>
                      {signedMoney(s.pnl)}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {s.count} trade{s.count === 1 ? '' : 's'}
                      {s.brokeRules && <span className="ml-1 text-rose-500" title="A rule was broken">⚠</span>}
                    </span>
                  </span>
                )}
              </Comp>
            )
          })}
        </div>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        Green = net-positive day, red = net-negative. ⚠ marks a day where at least one trade broke your rules. Everything
        here updates automatically as you log trades.
      </p>

      {/* Day detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? formatLongDate(selected) : ''} maxWidth="max-w-2xl">
        {selectedStat && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-3 dark:bg-neutral-800/50">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Day P&L</p>
                <p className={`text-xl font-bold tabular-nums ${pnlColor(selectedStat.pnl)}`}>{signedMoney(selectedStat.pnl)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Trades</p>
                <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{selectedStat.count}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">W / L</p>
                <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{selectedStat.wins} / {selectedStat.losses}</p>
              </div>
              <Link
                to={`/journal?tab=daily&date=${selected}`}
                onClick={() => setSelected(null)}
                className="btn-ghost ml-auto"
              >
                <BookIcon className="h-4 w-4" /> Open journal
              </Link>
            </div>

            <div className="space-y-2">
              {selectedTrades.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-2.5 dark:border-neutral-800">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {t.instrument}{' '}
                      <span className={`text-xs font-medium ${t.direction === 'short' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {t.direction} · {t.contracts}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(t.date)}
                      {accountName(t.accountId) ? ` · ${accountName(t.accountId)}` : ''}
                    </p>
                    {(t.tags || []).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className={`chip ${TAG_STYLES[tag] || ''}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 font-bold tabular-nums ${pnlColor(t.pnl)}`}>{signedMoney(t.pnl)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
