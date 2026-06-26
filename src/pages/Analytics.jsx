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
import { TAGS } from '../lib/constants'
import {
  summaryStats,
  equityCurve,
  drawdownProgression,
  winLossByHour,
  instrumentBreakdown,
  emotionVsPnl,
  rulesVsPnl,
} from '../lib/analytics'
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
  const { trades, settings, updateSettings } = useData()
  const [tab, setTab] = useState('charts')

  const stats = useMemo(() => summaryStats(trades), [trades])

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
      ) : (
        <AiTab trades={trades} stats={stats} settings={settings} updateSettings={updateSettings} />
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
  const emotions = useMemo(() => emotionVsPnl(trades, TAGS), [trades])
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
        <StatCard label="Net P&L" value={signedMoney(stats.totalPnl)} valueClassName={pnlColor(stats.totalPnl)} sub={`${stats.totalTrades} trades`} />
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

function AiTab({ trades, stats, settings, updateSettings }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insights, setInsights] = useState('')

  async function run() {
    setError('')
    setLoading(true)
    setInsights('')
    try {
      const summary = buildSummary({ trades })
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
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
