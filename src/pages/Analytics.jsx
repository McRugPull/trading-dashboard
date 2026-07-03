import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { EMOTION_TAGS } from '../lib/constants'
import {
  summaryStats,
  equityCurve,
  drawdownProgression,
  winLossByHour,
  instrumentBreakdown,
  emotionVsPnl,
  rulesVsPnl,
  reportBy,
  winsVsLosses,
} from '../lib/analytics'
import { TYPE_TAGS } from '../lib/constants'
import { hourOfDay, dayKey } from '../lib/date'
import { Card, PageHeader, EmptyState, StatCard } from '../components/ui'
import { ChartIcon, SparkIcon } from '../components/Icons'
import { money, signedMoney, pnlColor, pct, num } from '../lib/format'
import { generateInsights, buildSummary } from '../lib/ai'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Tooltip,
  Legend,
  Filler
)

const GREEN = '#10b981'
const RED = '#f43f5e'
const BRAND = '#327bff'
const AMBER = '#f59e0b'

function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const tick = dark ? '#94a3b8' : '#64748b'
  const grid = dark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.12)'
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: tick, boxWidth: 12, font: { size: 11 } } },
      tooltip: { intersect: false, mode: 'index' },
    },
    scales: {
      x: { ticks: { color: tick, font: { size: 11 } }, grid: { color: grid } },
      y: { ticks: { color: tick, font: { size: 11 } }, grid: { color: grid } },
    },
  }
  return { dark, tick, grid, base }
}

function ChartCard({ title, subtitle, children }) {
  return (
    <Card>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      <div className="mt-2 h-64">{children}</div>
    </Card>
  )
}

export default function Analytics() {
  const { trades, settings, updateSettings, feesTotal } = useData()
  const [tab, setTab] = useState('charts')

  const stats = useMemo(() => summaryStats(trades, feesTotal), [trades, feesTotal])

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="See where your edge — and your leaks — really are."
        actions={
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={() => setTab('charts')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === 'charts' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Charts
            </button>
            <button
              onClick={() => setTab('reports')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === 'reports' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setTab('ai')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === 'ai' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <SparkIcon className="h-4 w-4" /> AI Insights
            </button>
          </div>
        }
      />

      {trades.length === 0 ? (
        <EmptyState
          icon={ChartIcon}
          title="No data to analyse yet"
          message="Log some trades and your equity curve, time-of-day stats, and behavioural breakdowns will appear here."
        />
      ) : tab === 'charts' ? (
        <ChartsTab trades={trades} stats={stats} />
      ) : tab === 'reports' ? (
        <ReportsTab trades={trades} />
      ) : (
        <AiTab trades={trades} feesTotal={feesTotal} settings={settings} updateSettings={updateSettings} />
      )}
    </div>
  )
}

function ChartsTab({ trades, stats }) {
  const { base } = useChartTheme()

  const equity = useMemo(() => equityCurve(trades), [trades])
  const dd = useMemo(() => drawdownProgression(trades), [trades])
  const hours = useMemo(() => winLossByHour(trades), [trades])
  const instr = useMemo(() => instrumentBreakdown(trades), [trades])
  const emotions = useMemo(() => emotionVsPnl(trades, EMOTION_TAGS), [trades])
  const rules = useMemo(() => rulesVsPnl(trades), [trades])

  const equityData = {
    labels: equity.map((p) => p.label),
    datasets: [
      {
        label: 'Cumulative P&L',
        data: equity.map((p) => p.value),
        borderColor: BRAND,
        backgroundColor: 'rgba(50,123,255,0.12)',
        fill: true,
        tension: 0.25,
        pointRadius: equity.length > 40 ? 0 : 2,
      },
    ],
  }

  const ddData = {
    labels: dd.map((p) => p.label),
    datasets: [
      {
        label: 'Drawdown from peak',
        data: dd.map((p) => p.value),
        borderColor: RED,
        backgroundColor: 'rgba(244,63,94,0.15)',
        fill: true,
        tension: 0.2,
        pointRadius: dd.length > 40 ? 0 : 2,
      },
    ],
  }

  const hourData = {
    labels: hours.map((h) => `${h.hour}:00`),
    datasets: [
      { label: 'Wins', data: hours.map((h) => h.wins), backgroundColor: GREEN, borderRadius: 4 },
      { label: 'Losses', data: hours.map((h) => h.losses), backgroundColor: RED, borderRadius: 4 },
    ],
  }

  const instrData = {
    labels: instr.map((i) => i.instrument),
    datasets: [
      {
        label: 'Net P&L',
        data: instr.map((i) => i.pnl),
        backgroundColor: instr.map((i) => (i.pnl >= 0 ? GREEN : RED)),
        borderRadius: 4,
      },
    ],
  }

  const emotionData = {
    labels: emotions.map((e) => `${e.tag} (${e.count})`),
    datasets: [
      {
        label: 'Avg P&L per trade',
        data: emotions.map((e) => e.avgPnl),
        backgroundColor: emotions.map((e) => (e.avgPnl >= 0 ? GREEN : RED)),
        borderRadius: 4,
      },
    ],
  }

  const rulesData = {
    labels: [`Followed (${rules.followedCount})`, `Broken (${rules.brokenCount})`],
    datasets: [
      {
        label: 'Avg P&L per trade',
        data: [rules.followedAvg, rules.brokenAvg],
        backgroundColor: [GREEN, RED],
        borderRadius: 6,
      },
    ],
  }

  const moneyTooltip = {
    plugins: {
      ...base.plugins,
      tooltip: {
        ...base.plugins.tooltip,
        callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y ?? c.parsed)}` },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Net P&L" value={signedMoney(stats.totalPnl)} valueClassName={pnlColor(stats.totalPnl)} sub={`${stats.totalTrades} trades${stats.fees ? ` · ${money(stats.fees)} fees` : ''}`} />
        <StatCard label="Win rate" value={pct(stats.winRate)} sub={`${stats.wins}W / ${stats.losses}L`} />
        <StatCard
          label="Profit factor"
          value={stats.profitFactor === Infinity ? '∞' : num(stats.profitFactor)}
          sub={`Expectancy ${signedMoney(stats.expectancy)}/trade`}
        />
        <StatCard label="Rules followed" value={pct(stats.rulesFollowedPct)} sub={`Avg quality ${num(stats.avgQuality, 1)}★`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Equity curve" subtitle="Cumulative P&L across all trades, oldest → newest.">
          <Line data={equityData} options={{ ...base, ...moneyTooltip }} />
        </ChartCard>

        <ChartCard title="Drawdown progression" subtitle="How far equity sat below its running peak.">
          <Line data={ddData} options={{ ...base, ...moneyTooltip }} />
        </ChartCard>

        <ChartCard title="Win / loss by time of day" subtitle="Entry-hour buckets — find your best window.">
          <Bar data={hourData} options={base} />
        </ChartCard>

        <ChartCard title="Instrument breakdown" subtitle="Net P&L by instrument.">
          <Bar data={instrData} options={{ ...base, ...moneyTooltip }} />
        </ChartCard>

        <ChartCard title="Emotion vs P&L" subtitle="Average P&L per trade for each behavioural tag.">
          {emotions.length ? <Bar data={emotionData} options={{ ...base, ...moneyTooltip }} /> : <NoTagData />}
        </ChartCard>

        <ChartCard title="Rules followed vs P&L" subtitle={`Discipline pays: ${pct(stats.rulesFollowedPct)} of trades followed your rules.`}>
          <Bar data={rulesData} options={{ ...base, ...moneyTooltip }} />
        </ChartCard>
      </div>

      <p className="text-xs text-slate-400">
        Tip: assign tags and the “rules followed” flag on every trade so the behavioural charts above stay meaningful.
      </p>
    </div>
  )
}

function NoTagData() {
  return (
    <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
      Tag your trades (SND Setup, FOMO, …) to see this breakdown.
    </div>
  )
}

function AiTab({ trades, feesTotal, settings, updateSettings }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insights, setInsights] = useState('')

  async function run() {
    setError('')
    setLoading(true)
    setInsights('')
    try {
      const summary = buildSummary({ trades, fees: feesTotal })
      const text = await generateInsights({ apiKey: settings.apiKey, summary })
      setInsights(text)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-500/20 dark:from-brand-950/30 dark:to-neutral-900">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-brand-600 p-2 text-white">
            <SparkIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI trade coach</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sends your trade stats (numbers only — no screenshots or journal text) to Claude (claude-sonnet-4-6) and
              returns focused coaching on what to work on.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="label">Anthropic API key</label>
            <input
              type="password"
              className="input font-mono text-sm"
              placeholder="sk-ant-…"
              value={settings.apiKey || ''}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
            />
          </div>
          <button className="btn-primary h-[42px]" onClick={run} disabled={loading || !settings.apiKey}>
            {loading ? 'Analysing…' : 'Generate insights'}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
          ⚠ Your key is stored in this browser and sent directly to Anthropic from your device. Use a key with a low
          spend cap, and never use this on a shared computer.
        </p>
      </Card>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <Card>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Reviewing your last {Math.min(trades.length, 40)} trades…
          </div>
        </Card>
      )}

      {insights && (
        <Card>
          <Markdown text={insights} />
        </Card>
      )}

      {!insights && !loading && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Paste your API key and hit <strong>Generate insights</strong> for a personalised review.
        </p>
      )}
    </div>
  )
}

// Tiny markdown renderer: handles ## headings, bullet lists, and **bold**.
function Markdown({ text }) {
  const lines = text.split('\n')
  const out = []
  let list = []
  const flush = (key) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`} className="my-2 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
          {list.map((it, i) => (
            <li key={i}>{inline(it)}</li>
          ))}
        </ul>
      )
      list = []
    }
  }
  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    if (/^#{1,6}\s/.test(line)) {
      flush(i)
      const txt = line.replace(/^#{1,6}\s/, '')
      out.push(
        <h4 key={i} className="mt-4 text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          {inline(txt)}
        </h4>
      )
    } else if (/^[-*]\s/.test(line)) {
      list.push(line.replace(/^[-*]\s/, ''))
    } else if (line === '') {
      flush(i)
    } else {
      flush(i)
      out.push(
        <p key={i} className="my-1 text-slate-700 dark:text-slate-200">
          {inline(line)}
        </p>
      )
    }
  })
  flush('end')
  return <div className="text-[15px] leading-relaxed">{out}</div>
}

function inline(text) {
  // Split on **bold** segments.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p) ? (
      <strong key={i} className="font-semibold text-slate-900 dark:text-white">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

// ─── Reports tab ─────────────────────────────────────────────────────────────
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DIMENSIONS = [
  { id: 'dow', label: 'Day of week' },
  { id: 'hour', label: 'Time of day' },
  { id: 'month', label: 'Month' },
  { id: 'instrument', label: 'Instrument' },
  { id: 'side', label: 'Long vs Short' },
  { id: 'type', label: 'Trade type' },
  { id: 'emotion', label: 'Emotion' },
  { id: 'playbook', label: 'Playbook' },
  { id: 'quality', label: 'Quality rating' },
]

function ReportsTab({ trades }) {
  const { playbooks } = useData()
  const { base } = useChartTheme()
  const [dim, setDim] = useState('dow')

  const rows = useMemo(() => {
    const pbName = (id) => playbooks.find((p) => p.id === id)?.name
    const keyFns = {
      dow: (t) => {
        const [y, m, d] = dayKey(t.date).split('-').map(Number)
        return `${new Date(y, m - 1, d).getDay()}|${WEEKDAY_NAMES[new Date(y, m - 1, d).getDay()]}`
      },
      hour: (t) => {
        const h = hourOfDay(t.date)
        return h == null ? null : `${String(h).padStart(2, '0')}|${h}:00`
      },
      month: (t) => {
        const k = dayKey(t.date).slice(0, 7)
        return `${k}|${k}`
      },
      instrument: (t) => (t.instrument ? `${t.instrument}|${t.instrument}` : null),
      side: (t) => (t.direction === 'short' ? '1|Short' : '0|Long'),
      type: (t) => (t.tags || []).filter((tag) => TYPE_TAGS.includes(tag)).map((tag) => `${tag}|${tag}`),
      emotion: (t) => (t.tags || []).filter((tag) => EMOTION_TAGS.includes(tag)).map((tag) => `${tag}|${tag}`),
      playbook: (t) => (t.playbookId && pbName(t.playbookId) ? `${pbName(t.playbookId)}|${pbName(t.playbookId)}` : null),
      quality: (t) => (t.quality ? `${t.quality}|${'★'.repeat(t.quality)}` : null),
    }
    const raw = reportBy(trades, keyFns[dim])
    return raw
      .map((r) => ({ ...r, sortKey: r.bucket.split('|')[0], label: r.bucket.split('|')[1] }))
      .sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1))
  }, [trades, dim, playbooks])

  const wl = useMemo(() => winsVsLosses(trades), [trades])

  const best = rows.length ? rows.reduce((a, b) => (b.netPnl > a.netPnl ? b : a)) : null
  const worst = rows.length ? rows.reduce((a, b) => (b.netPnl < a.netPnl ? b : a)) : null
  const active = rows.length ? rows.reduce((a, b) => (b.trades > a.trades ? b : a)) : null
  const bestWin = rows.length ? rows.reduce((a, b) => (b.winRate > a.winRate ? b : a)) : null

  const moneyTip = {
    plugins: {
      ...base.plugins,
      tooltip: { ...base.plugins.tooltip, callbacks: { label: (c) => money(c.parsed.y ?? c.parsed) } },
    },
  }

  return (
    <div className="space-y-6">
      {/* Dimension picker */}
      <div className="flex flex-wrap gap-2">
        {DIMENSIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDim(d.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              dim === d.id
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 text-slate-600 hover:border-brand-400 dark:border-neutral-700 dark:text-slate-300'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-neutral-700">
          No data for this breakdown yet — tag/assign your trades and it fills in.
        </p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ReportCard title="Best" value={best.label} sub={signedMoney(best.netPnl)} subClass={pnlColor(best.netPnl)} />
            <ReportCard title="Worst" value={worst.label} sub={signedMoney(worst.netPnl)} subClass={pnlColor(worst.netPnl)} />
            <ReportCard title="Most active" value={active.label} sub={`${active.trades} trades`} />
            <ReportCard title="Highest win rate" value={bestWin.label} sub={pct(bestWin.winRate)} />
          </div>

          {/* Chart */}
          <Card>
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Net P&L by {DIMENSIONS.find((d) => d.id === dim)?.label.toLowerCase()}
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: rows.map((r) => r.label),
                  datasets: [
                    {
                      label: 'Net P&L',
                      data: rows.map((r) => r.netPnl),
                      backgroundColor: rows.map((r) => (r.netPnl >= 0 ? GREEN : RED)),
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{ ...base, ...moneyTip }}
              />
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto !p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-neutral-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Bucket</th>
                  <th className="px-4 py-3 text-right font-medium">Trades</th>
                  <th className="px-4 py-3 text-right font-medium">Net P&L</th>
                  <th className="px-4 py-3 text-right font-medium">Win %</th>
                  <th className="px-4 py-3 text-right font-medium">Avg win</th>
                  <th className="px-4 py-3 text-right font-medium">Avg loss</th>
                  <th className="px-4 py-3 text-right font-medium">Expectancy</th>
                  <th className="px-4 py-3 text-right font-medium">PF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {rows.map((r) => (
                  <tr key={r.bucket} className="bg-white dark:bg-neutral-900">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{r.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.trades}</td>
                    <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${pnlColor(r.netPnl)}`}>{signedMoney(r.netPnl)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.winRate)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-500">{money(r.avgWin)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-rose-500">{money(Math.abs(r.avgLoss))}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${pnlColor(r.expectancy)}`}>{signedMoney(r.expectancy)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.profitFactor === Infinity ? '∞' : num(r.profitFactor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Winners vs Losers */}
      {(wl.winners || wl.losers) && (
        <Card>
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Winners vs losers</h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            What your winning trades have in common that your losers don&apos;t.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <WlColumn title="Winning trades" data={wl.winners} tone="emerald" />
            <WlColumn title="Losing trades" data={wl.losers} tone="rose" />
          </div>
        </Card>
      )}
    </div>
  )
}

function ReportCard({ title, value, sub, subClass = '' }) {
  return (
    <Card className="!p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className={`text-xs ${subClass || 'text-slate-500 dark:text-slate-400'}`}>{sub}</p>
    </Card>
  )
}

function WlColumn({ title, data, tone }) {
  const toneText = tone === 'emerald' ? 'text-emerald-500' : 'text-rose-500'
  if (!data)
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-neutral-700">
        No {title.toLowerCase()} yet.
      </div>
    )
  const rowCls = 'flex items-center justify-between py-1.5 text-sm'
  return (
    <div className={`rounded-xl border p-4 ${tone === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
      <p className={`mb-2 font-semibold ${toneText}`}>{title} ({data.count})</p>
      <div className="divide-y divide-slate-100 dark:divide-neutral-800">
        <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Total P&L</span><span className={`font-bold tabular-nums ${toneText}`}>{signedMoney(data.totalPnl)}</span></div>
        <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Avg P&L / trade</span><span className="tabular-nums">{signedMoney(data.avgPnl)}</span></div>
        <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Avg contracts</span><span className="tabular-nums">{num(data.avgContracts)}</span></div>
        {data.avgHour != null && (
          <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Avg entry time</span><span className="tabular-nums">{data.avgHour}:00</span></div>
        )}
        {data.avgR != null && (
          <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Avg R-multiple</span><span className="tabular-nums">{num(data.avgR)}R</span></div>
        )}
        {data.avgQuality != null && (
          <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Avg quality</span><span className="tabular-nums">{num(data.avgQuality, 1)}★</span></div>
        )}
        <div className={rowCls}><span className="text-slate-500 dark:text-slate-400">Rules followed</span><span className="tabular-nums">{pct(data.rulesFollowedPct)}</span></div>
        {data.topTags.length > 0 && (
          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">Top tags: {data.topTags.join(' · ')}</div>
        )}
      </div>
    </div>
  )
}
