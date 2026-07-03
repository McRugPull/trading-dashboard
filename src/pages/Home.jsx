import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  RadarController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Radar } from 'react-chartjs-2'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { summaryStats, equityCurve, dailyStats, edgeScore, streaks, dayWinPct } from '../lib/analytics'
import { money, signedMoney, pnlColor, pct, money0, num } from '../lib/format'
import { formatLongDate, formatDateTime } from '../lib/date'
import { Card, Meter, PageHeader } from '../components/ui'
import { AlertIcon, WalletIcon, ChartIcon } from '../components/Icons'
import { TAG_STYLES } from '../lib/constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  RadarController,
  Tooltip,
  Legend,
  Filler
)

const GREEN = '#10b981'
const RED = '#f43f5e'
const BRAND = '#327bff'

// Compact signed money for tiles: no cents, keeps the sign.
function sMoney0(n) {
  const v = Number(n) || 0
  return (v > 0 ? '+' : v < 0 ? '-' : '') + money0(Math.abs(v))
}

function scoreTone(score) {
  if (score >= 70) return { text: 'text-emerald-500', ring: '#10b981' }
  if (score >= 45) return { text: 'text-amber-500', ring: '#f59e0b' }
  return { text: 'text-rose-500', ring: '#f43f5e' }
}

// Small stat tile in the TradeZella style: label, big value, sub detail.
function Tile({ label, value, sub, valueClassName = '' }) {
  return (
    <Card className="!p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xl font-bold tabular-nums sm:text-2xl ${valueClassName || 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </Card>
  )
}

export default function Home() {
  const { trades, accounts, accountStats, todayPnl, todays, todayFee, feesTotal, streak, anyRulesBrokenToday, settings, dailyFees } =
    useData()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const tick = dark ? '#94a3b8' : '#64748b'
  const grid = dark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.12)'

  const stats = useMemo(() => summaryStats(trades, feesTotal), [trades, feesTotal])
  const score = useMemo(() => edgeScore(trades, feesTotal), [trades, feesTotal])
  const stk = useMemo(() => streaks(trades), [trades])
  const equity = useMemo(() => equityCurve(trades), [trades])
  const daily = useMemo(() => {
    const map = dailyStats(trades, dailyFees)
    return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-30)
  }, [trades, dailyFees])

  const wlRatio = Math.abs(stats.avgLoss) > 0 ? stats.avgWin / Math.abs(stats.avgLoss) : stats.avgWin > 0 ? Infinity : 0
  const tone = scoreTone(score.score)

  const recent = useMemo(
    () => trades.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [trades]
  )

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } },
    scales: {
      x: { ticks: { color: tick, font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: grid } },
      y: { ticks: { color: tick, font: { size: 10 } }, grid: { color: grid } },
    },
  }

  return (
    <div>
      <PageHeader title={`Welcome back${settings.name ? `, ${settings.name}` : ''}`} subtitle={formatLongDate(new Date())} />

      {anyRulesBrokenToday && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800 dark:border-rose-800/60 dark:bg-rose-900/30 dark:text-rose-200">
          <AlertIcon className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Rules broken today</p>
            <p className="text-sm text-rose-700/90 dark:text-rose-300/90">
              A trade today carried a negative emotion tag or was marked rules-not-followed. Step back and protect your account.{' '}
              <Link to="/trades" className="font-semibold underline underline-offset-2">
                Review today&apos;s trades
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Tile
          label="Net P&L"
          value={sMoney0(stats.totalPnl)}
          sub={`${stats.totalTrades} trades${stats.fees ? ` · ${money(stats.fees)} fees` : ''}`}
          valueClassName={pnlColor(stats.totalPnl)}
        />
        <Tile
          label="Today"
          value={sMoney0(todayPnl)}
          sub={`${todays.length} trade${todays.length === 1 ? '' : 's'}${todayFee ? ` · ${money(todayFee)} fees` : ''}`}
          valueClassName={pnlColor(todayPnl)}
        />
        <Tile label="Trade expectancy" value={sMoney0(stats.expectancy)} sub="avg P&L per trade" valueClassName={pnlColor(stats.expectancy)} />
        <Tile
          label="Profit factor"
          value={stats.profitFactor === Infinity ? '∞' : num(stats.profitFactor)}
          sub="gross win ÷ gross loss"
          valueClassName={stats.profitFactor >= 1.5 ? 'text-emerald-500' : stats.profitFactor >= 1 ? 'text-amber-500' : 'text-rose-500'}
        />
        <Tile label="Win rate" value={pct(stats.winRate)} sub={`${stats.wins}W / ${stats.losses}L`} />
        <Tile label="Day win %" value={pct(dayWinPct(trades))} sub="green days ÷ all days" />
        <Tile
          label="Avg win / loss"
          value={wlRatio === Infinity ? '∞' : num(wlRatio)}
          sub={`${money(stats.avgWin)} / ${money(Math.abs(stats.avgLoss))}`}
          valueClassName={wlRatio >= 1.5 ? 'text-emerald-500' : wlRatio >= 1 ? 'text-amber-500' : 'text-rose-500'}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Edge Score */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Edge Score</h2>
            <span className={`text-3xl font-black tabular-nums ${tone.text}`}>{Math.round(score.score)}</span>
          </div>
          <div className="h-56">
            <Radar
              data={{
                labels: score.components.map((c) => c.label),
                datasets: [
                  {
                    data: score.components.map((c) => c.value),
                    backgroundColor: 'rgba(50,123,255,0.18)',
                    borderColor: BRAND,
                    borderWidth: 2,
                    pointBackgroundColor: BRAND,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false, stepSize: 25 },
                    grid: { color: grid },
                    angleLines: { color: grid },
                    pointLabels: { color: tick, font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-400">
            Win % · profit factor · win/loss · recovery · drawdown · consistency
          </p>
        </Card>

        {/* Cumulative P&L */}
        <Card>
          <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">Cumulative P&L</h2>
          <div className="h-56">
            {equity.length ? (
              <Line
                data={{
                  labels: equity.map((p) => p.label),
                  datasets: [
                    {
                      data: equity.map((p) => p.value),
                      borderColor: BRAND,
                      backgroundColor: 'rgba(50,123,255,0.12)',
                      fill: true,
                      tension: 0.25,
                      pointRadius: equity.length > 40 ? 0 : 2,
                    },
                  ],
                }}
                options={baseOpts}
              />
            ) : (
              <EmptyChart />
            )}
          </div>
        </Card>

        {/* Net daily P&L */}
        <Card>
          <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">Net daily P&L</h2>
          <div className="h-56">
            {daily.length ? (
              <Bar
                data={{
                  labels: daily.map((d) => d.date.slice(5)),
                  datasets: [
                    {
                      data: daily.map((d) => d.pnl),
                      backgroundColor: daily.map((d) => (d.pnl >= 0 ? GREEN : RED)),
                      borderRadius: 3,
                    },
                  ],
                }}
                options={baseOpts}
              />
            ) : (
              <EmptyChart />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Accounts */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <WalletIcon className="h-5 w-5 text-brand-500" /> Account drawdown
            </h2>
            <Link to="/accounts" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              Manage →
            </Link>
          </div>
          {accounts.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No accounts yet.{' '}
              <Link to="/accounts" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                Add a funded account
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-5">
              {accounts.map((acc) => {
                const s = accountStats(acc)
                return (
                  <div key={acc.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{acc.name}</span>
                      <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
                        {money0(s.currentBalance)} · {money(s.remaining)} buffer
                      </span>
                    </div>
                    <Meter value={s.usedPct} max={100} valueLabel={`${pct(s.usedPct)} of ${money0(acc.drawdownLimit)}`} label="Used" dangerHigh />
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center dark:border-neutral-800">
            <MiniStat label="Rules streak" value={`${streak}d`} good={streak > 0} />
            <MiniStat label="Best win streak" value={stk.maxWinStreak} good />
            <MiniStat label="Worst loss streak" value={stk.maxLossStreak} good={false} />
          </div>
        </Card>

        {/* Recent trades */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <ChartIcon className="h-5 w-5 text-brand-500" /> Recent trades
            </h2>
            <Link to="/trades" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              All trades →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No trades yet —{' '}
              <Link to="/trades" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                log your first
              </Link>
              .
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-neutral-800">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.instrument}{' '}
                      <span className={`text-xs font-medium ${t.direction === 'short' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {t.direction}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(t.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(t.tags || []).slice(0, 1).map((tag) => (
                      <span key={tag} className={`chip hidden sm:inline-flex ${TAG_STYLES[tag] || ''}`}>
                        {tag}
                      </span>
                    ))}
                    <span className={`font-bold tabular-nums ${pnlColor(t.pnl)}`}>{signedMoney(t.pnl)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value, good }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${good ? 'text-emerald-500' : 'text-rose-500'}`}>{value}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">Log trades to see this chart.</div>
  )
}
