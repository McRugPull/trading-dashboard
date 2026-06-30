import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { summaryStats } from '../lib/analytics'
import { money, signedMoney, pnlColor, pct, money0 } from '../lib/format'
import { formatLongDate } from '../lib/date'
import { Card, StatCard, Meter, PageHeader } from '../components/ui'
import { AlertIcon, FlameIcon, TrophyIcon, WalletIcon, ChartIcon, TargetIcon } from '../components/Icons'

export default function Home() {
  const { trades, accounts, accountStats, todayPnl, todays, todayFee, feesTotal, streak, anyRulesBrokenToday, settings } =
    useData()
  const stats = summaryStats(trades, feesTotal)
  const todayStats = summaryStats(todays, todayFee)

  return (
    <div>
      <PageHeader title={`Welcome back, ${settings.name || 'trader'}`} subtitle={formatLongDate(new Date())} />

      {anyRulesBrokenToday && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800 dark:border-rose-800/60 dark:bg-rose-900/30 dark:text-rose-200">
          <AlertIcon className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Rules broken today</p>
            <p className="text-sm text-rose-700/90 dark:text-rose-300/90">
              At least one trade today was flagged as a rule break (Gamble / Revenge / FOMO / Bored, or marked rules-not-followed).
              Step back, breathe, and protect your account.{' '}
              <Link to="/trades" className="font-semibold underline underline-offset-2">
                Review today&apos;s trades
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Stat row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's P&L"
          value={signedMoney(todayPnl)}
          sub={`${todays.length} trade${todays.length === 1 ? '' : 's'}${todayFee ? ` · ${money(todayFee)} fees` : ''}`}
          icon={ChartIcon}
          valueClassName={pnlColor(todayPnl)}
        />
        <StatCard
          label="Rules streak"
          value={`${streak} day${streak === 1 ? '' : 's'}`}
          sub={streak > 0 ? 'Clean trading days in a row' : 'Start a fresh streak today'}
          icon={FlameIcon}
          valueClassName={streak > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}
        />
        <StatCard
          label="Net P&L (all time)"
          value={signedMoney(stats.totalPnl)}
          sub={`${stats.totalTrades} trades · ${pct(stats.winRate)} win${feesTotal ? ` · ${money(feesTotal)} fees` : ''}`}
          icon={TrophyIcon}
          valueClassName={pnlColor(stats.totalPnl)}
        />
        <StatCard
          label="Rules followed"
          value={pct(stats.rulesFollowedPct)}
          sub="Across all logged trades"
          icon={TargetIcon}
          valueClassName={stats.rulesFollowedPct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
        />
      </div>

      {/* Account drawdown */}
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
            </Link>{' '}
            to watch your drawdown buffer.
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
                  <Meter
                    value={s.usedPct}
                    max={100}
                    valueLabel={`${pct(s.usedPct)} of ${money0(acc.drawdownLimit)} drawdown`}
                    label="Used"
                    dangerHigh
                  />
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Today quick glance */}
      {todays.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Today at a glance</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Glance label="Trades" value={todayStats.totalTrades} />
            <Glance label="Win rate" value={pct(todayStats.winRate)} />
            <Glance label="Best" value={signedMoney(todayStats.bestTrade)} className={pnlColor(todayStats.bestTrade)} />
            <Glance label="Worst" value={signedMoney(todayStats.worstTrade)} className={pnlColor(todayStats.worstTrade)} />
          </div>
        </Card>
      )}
    </div>
  )
}

function Glance({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${className || 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  )
}
