import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { quoteForDay } from '../lib/quotes'
import { summaryStats } from '../lib/analytics'
import { money, signedMoney, pnlColor, pct, money0 } from '../lib/format'
import { formatLongDate, todayKey, dayOfYear } from '../lib/date'
import { Card, StatCard, Meter, PageHeader } from '../components/ui'
import {
  AlertIcon,
  FlameIcon,
  TrophyIcon,
  WalletIcon,
  BookIcon,
  ChartIcon,
  TargetIcon,
} from '../components/Icons'

const JOURNAL_PROMPTS = [
  'What is your single A+ setup for today, and where will you NOT trade?',
  'What did yesterday teach you that you can apply right now?',
  'How is your mindset before the session — calm, rushed, or revenge-y?',
  'What would make today a win even if you take zero trades?',
  'Where are you most likely to break a rule today, and how will you prevent it?',
  'What is your max loss for the day and your plan when you hit it?',
  'Which emotion derailed you last week, and what is the trigger?',
]

export default function Home() {
  const { trades, accounts, accountStats, todayPnl, todays, streak, anyRulesBrokenToday, settings, getJournal } =
    useData()
  const quote = quoteForDay()
  const stats = summaryStats(trades)
  const todayStats = summaryStats(todays)
  const prompt = JOURNAL_PROMPTS[dayOfYear() % JOURNAL_PROMPTS.length]
  const todayJournal = getJournal('daily', todayKey())
  const hasMorningPlan = !!todayJournal?.morningPlan?.trim()

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

      {/* Quote of the day */}
      <Card className="mb-6 border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-900/40 dark:from-brand-950/40 dark:to-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Today&apos;s mindset
        </p>
        <blockquote className="mt-2 text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100">
          “{quote.text}”
        </blockquote>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">— {quote.author}</p>
      </Card>

      {/* Stat row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's P&L"
          value={signedMoney(todayPnl)}
          sub={`${todays.length} trade${todays.length === 1 ? '' : 's'} today`}
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
          sub={`${stats.totalTrades} trades · ${pct(stats.winRate)} win`}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account drawdown meters */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Journal prompt */}
        <div>
          <Card className="flex h-full flex-col">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <BookIcon className="h-5 w-5 text-brand-500" /> Journal prompt
            </h2>
            <p className="flex-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">{prompt}</p>
            <div className="mt-4">
              {hasMorningPlan ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300">
                  ✓ Morning plan written for today.
                  <Link to="/journal" className="ml-1 font-semibold underline underline-offset-2">
                    Open journal
                  </Link>
                </div>
              ) : (
                <Link to="/journal" className="btn-primary w-full">
                  Write today&apos;s plan
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>

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
