// Pure derivation helpers over the trades array. Kept separate from React so
// they can feed the Home cards, the Analytics charts, and the AI summary alike.

import { BAD_TAGS } from './constants'
import { dayKey, hourOfDay, todayKey } from './date'
import { round2 } from './pnl'

// A trade breaks the rules if it was explicitly flagged as such, or carries any
// "bad" behavioural tag (Gamble / Revenge / FOMO / Bored).
export function tradeBrokeRules(t) {
  if (t.rulesFollowed === false) return true
  return (t.tags || []).some((tag) => BAD_TAGS.includes(tag))
}

export function byDateAsc(trades) {
  return trades.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function tradesOn(trades, key) {
  return trades.filter((t) => dayKey(t.date) === key)
}

export function todayTrades(trades) {
  return tradesOn(trades, todayKey())
}

export function sumPnl(trades) {
  return round2(trades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0))
}

// Headline stats for a set of trades. `fees` (total daily fees for the period)
// is subtracted from the net P&L and expectancy so the headline numbers are
// accurate even when fees are logged once per day rather than per trade.
export function summaryStats(trades, fees = 0) {
  const total = trades.length
  const wins = trades.filter((t) => (t.pnl || 0) > 0)
  const losses = trades.filter((t) => (t.pnl || 0) < 0)
  const grossWin = sumPnl(wins)
  const grossLoss = sumPnl(losses) // negative
  const grossPnl = round2(grossWin + grossLoss)
  const totalPnl = round2(grossPnl - (Number(fees) || 0)) // net of fees
  const followed = trades.filter((t) => !tradeBrokeRules(t))
  const qualityRated = trades.filter((t) => t.quality)

  return {
    totalTrades: total,
    wins: wins.length,
    losses: losses.length,
    breakeven: total - wins.length - losses.length,
    grossPnl,
    fees: round2(Number(fees) || 0),
    totalPnl,
    winRate: total ? round2((wins.length / total) * 100) : 0,
    avgWin: wins.length ? round2(grossWin / wins.length) : 0,
    avgLoss: losses.length ? round2(grossLoss / losses.length) : 0,
    profitFactor: grossLoss !== 0 ? round2(grossWin / Math.abs(grossLoss)) : grossWin > 0 ? Infinity : 0,
    expectancy: total ? round2(totalPnl / total) : 0,
    bestTrade: total ? round2(Math.max(...trades.map((t) => t.pnl || 0))) : 0,
    worstTrade: total ? round2(Math.min(...trades.map((t) => t.pnl || 0))) : 0,
    avgQuality: qualityRated.length
      ? round2(qualityRated.reduce((a, t) => a + Number(t.quality), 0) / qualityRated.length)
      : 0,
    rulesFollowedPct: total ? round2((followed.length / total) * 100) : 0,
  }
}

// Consecutive trading days (most recent first) where every trade followed the
// rules. Days with no trades are skipped (they neither extend nor break it).
export function rulesStreak(trades) {
  if (!trades.length) return 0
  const byDay = {}
  for (const t of trades) {
    const k = dayKey(t.date)
    ;(byDay[k] ||= []).push(t)
  }
  const days = Object.keys(byDay).sort((a, b) => (a < b ? 1 : -1)) // desc
  let streak = 0
  for (const d of days) {
    const clean = byDay[d].every((t) => !tradeBrokeRules(t))
    if (clean) streak++
    else break
  }
  return streak
}

// Cumulative P&L over time → equity curve points.
export function equityCurve(trades) {
  const sorted = byDateAsc(trades)
  let cum = 0
  const points = sorted.map((t, i) => {
    cum = round2(cum + (Number(t.pnl) || 0))
    return { label: `#${i + 1}`, date: t.date, value: cum }
  })
  return points
}

// Running drawdown (peak equity minus current equity) over time.
export function drawdownProgression(trades) {
  const curve = equityCurve(trades)
  let peak = 0
  return curve.map((p) => {
    peak = Math.max(peak, p.value)
    return { label: p.label, date: p.date, value: round2(p.value - peak) } // <= 0
  })
}

// Win/loss counts bucketed by hour of day (entry time).
export function winLossByHour(trades) {
  const buckets = {}
  for (const t of trades) {
    const h = hourOfDay(t.date)
    if (h == null) continue
    buckets[h] ||= { hour: h, wins: 0, losses: 0, pnl: 0 }
    if ((t.pnl || 0) > 0) buckets[h].wins++
    else if ((t.pnl || 0) < 0) buckets[h].losses++
    buckets[h].pnl = round2(buckets[h].pnl + (Number(t.pnl) || 0))
  }
  return Object.values(buckets).sort((a, b) => a.hour - b.hour)
}

// Total P&L per instrument.
export function instrumentBreakdown(trades) {
  const map = {}
  for (const t of trades) {
    const k = t.instrument || '—'
    map[k] ||= { instrument: k, pnl: 0, count: 0 }
    map[k].pnl = round2(map[k].pnl + (Number(t.pnl) || 0))
    map[k].count++
  }
  return Object.values(map).sort((a, b) => b.pnl - a.pnl)
}

// Average P&L per behavioural tag (emotion vs P&L).
export function emotionVsPnl(trades, tags) {
  return tags
    .map((tag) => {
      const tagged = trades.filter((t) => (t.tags || []).includes(tag))
      return {
        tag,
        count: tagged.length,
        avgPnl: tagged.length ? round2(sumPnl(tagged) / tagged.length) : 0,
        totalPnl: sumPnl(tagged),
      }
    })
    .filter((r) => r.count > 0)
}

// Rules-followed vs broken: average P&L of each cohort.
export function rulesVsPnl(trades) {
  const followed = trades.filter((t) => !tradeBrokeRules(t))
  const broken = trades.filter((t) => tradeBrokeRules(t))
  return {
    followedCount: followed.length,
    brokenCount: broken.length,
    followedAvg: followed.length ? round2(sumPnl(followed) / followed.length) : 0,
    brokenAvg: broken.length ? round2(sumPnl(broken) / broken.length) : 0,
    followedTotal: sumPnl(followed),
    brokenTotal: sumPnl(broken),
  }
}

// Per-day rollups keyed by "YYYY-MM-DD" — feeds the Calendar.
export function dailyStats(trades, dailyFees = {}) {
  const map = {}
  const ensure = (k) =>
    (map[k] ||= { date: k, pnl: 0, grossPnl: 0, fees: 0, count: 0, wins: 0, losses: 0, brokeRules: false })
  for (const t of trades) {
    const d = ensure(dayKey(t.date))
    d.grossPnl = round2(d.grossPnl + (Number(t.pnl) || 0))
    d.count++
    if ((t.pnl || 0) > 0) d.wins++
    else if ((t.pnl || 0) < 0) d.losses++
    if (tradeBrokeRules(t)) d.brokeRules = true
  }
  // Apply daily fees (include days that have only fees and no trades).
  for (const k of Object.keys(dailyFees)) {
    const fee = Number(dailyFees[k]) || 0
    if (fee) ensure(k).fees = round2(fee)
  }
  for (const k of Object.keys(map)) {
    map[k].pnl = round2(map[k].grossPnl - map[k].fees)
  }
  return map
}

// Per-account balance, drawdown, and profit-target progress from that account's
// assigned trades. Drawdown is computed per the account's `drawdownType`:
//   - 'static'            → fixed floor at (start − limit)
//   - 'trailing-*'        → floor trails the high-water mark but locks once it
//                           reaches the starting balance (standard prop behaviour)
export function accountStats(account, trades) {
  const start = Number(account.startingBalance) || 0
  const limit = Number(account.drawdownLimit) || 0
  const type = account.drawdownType || 'trailing-eod'
  const profitTarget = Number(account.profitTarget) || 0
  const accTrades = byDateAsc(trades.filter((t) => t.accountId === account.id))

  let bal = start
  let hwm = start
  for (const t of accTrades) {
    bal = round2(bal + (Number(t.pnl) || 0))
    hwm = Math.max(hwm, bal)
  }

  const floor = type === 'static' ? round2(start - limit) : round2(Math.min(hwm - limit, start))
  const remaining = round2(bal - floor) // dollars of buffer left to the liquidation floor
  const drawdownUsed = round2(limit - remaining)
  const usedPct = limit > 0 ? Math.min(100, Math.max(0, round2((drawdownUsed / limit) * 100))) : 0

  const netPnl = round2(bal - start)
  const profitProgressPct = profitTarget > 0 ? Math.min(100, Math.max(0, round2((netPnl / profitTarget) * 100))) : 0

  return {
    currentBalance: bal,
    highWaterMark: hwm,
    floor,
    drawdownUsed,
    remaining,
    usedPct,
    tradeCount: accTrades.length,
    netPnl,
    profitTarget,
    profitProgressPct,
    targetReached: profitTarget > 0 && netPnl >= profitTarget,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TradeZella-style metrics
// ─────────────────────────────────────────────────────────────────────────────

// Longest / current win & loss streaks (by trade, chronological).
export function streaks(trades) {
  const sorted = byDateAsc(trades)
  let maxWin = 0
  let maxLoss = 0
  let curWin = 0
  let curLoss = 0
  for (const t of sorted) {
    const p = Number(t.pnl) || 0
    if (p > 0) {
      curWin++
      curLoss = 0
      maxWin = Math.max(maxWin, curWin)
    } else if (p < 0) {
      curLoss++
      curWin = 0
      maxLoss = Math.max(maxLoss, curLoss)
    }
  }
  return { maxWinStreak: maxWin, maxLossStreak: maxLoss, currentWinStreak: curWin, currentLossStreak: curLoss }
}

// Max drawdown ($ from equity peak) and recovery factor (net / maxDD).
export function drawdownMetrics(trades) {
  const dd = drawdownProgression(trades) // values <= 0
  const maxDrawdown = dd.length ? round2(Math.min(...dd.map((p) => p.value))) : 0 // negative or 0
  const net = sumPnl(trades)
  const recoveryFactor = maxDrawdown < 0 ? round2(net / Math.abs(maxDrawdown)) : net > 0 ? Infinity : 0
  return { maxDrawdown, recoveryFactor }
}

// Day-win% + P&L bucketed by weekday (Sun..Sat) from per-day rollups.
export function dayOfWeekStats(trades) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const byDay = {}
  for (const t of trades) {
    const k = dayKey(t.date)
    ;(byDay[k] ||= []).push(t)
  }
  const buckets = names.map((name, i) => ({ dow: i, name, days: 0, greenDays: 0, trades: 0, pnl: 0 }))
  for (const [k, dayTrades] of Object.entries(byDay)) {
    const [y, m, d] = k.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    const b = buckets[dow]
    const pnl = sumPnl(dayTrades)
    b.days++
    b.trades += dayTrades.length
    b.pnl = round2(b.pnl + pnl)
    if (pnl > 0) b.greenDays++
  }
  return buckets.filter((b) => b.days > 0)
}

// Consistency: how evenly profits are distributed across winning days.
// 100 = no single day dominates; low = one big day carried (or made) the total.
export function consistencyScore(trades) {
  const byDay = {}
  for (const t of trades) {
    const k = dayKey(t.date)
    byDay[k] = round2((byDay[k] || 0) + (Number(t.pnl) || 0))
  }
  const dayPnls = Object.values(byDay)
  const totalAbs = dayPnls.reduce((a, v) => a + Math.abs(v), 0)
  if (!totalAbs) return 0
  const biggestAbs = Math.max(...dayPnls.map((v) => Math.abs(v)))
  // Share of total absolute daily P&L contributed by the single biggest day.
  const dominance = biggestAbs / totalAbs
  // 1 day → dominance 1 → score 0; perfectly even across n days → score → 100.
  const n = dayPnls.length
  const minDominance = 1 / n
  const score = n <= 1 ? 0 : (1 - (dominance - minDominance) / (1 - minDominance)) * 100
  return round2(Math.min(100, Math.max(0, score)))
}

// Banded score used by the Zella-style score for profit factor and avg
// win/loss: >=2.6 → 100, 10-point bands down to 1.8, then a linear ramp below
// so a small sample doesn't fall off a cliff.
function bandedRatioScore(v) {
  if (!Number.isFinite(v)) v = 0
  if (v >= 2.6) return 100
  if (v >= 2.4) return 90 + ((v - 2.4) / 0.2) * 9
  if (v >= 2.2) return 80 + ((v - 2.2) / 0.2) * 9
  if (v >= 2.0) return 70 + ((v - 2.0) / 0.2) * 9
  if (v >= 1.9) return 60 + ((v - 1.9) / 0.1) * 9
  if (v >= 1.8) return 50 + ((v - 1.8) / 0.1) * 9
  return Math.max(0, (v / 1.8) * 50)
}

// % of trading days that finished green (breakeven days excluded).
export function dayWinPct(trades) {
  const byDay = {}
  for (const t of trades) {
    const k = dayKey(t.date)
    byDay[k] = round2((byDay[k] || 0) + (Number(t.pnl) || 0))
  }
  const nonBE = Object.values(byDay).filter((v) => v !== 0)
  if (!nonBE.length) return 0
  return round2((nonBE.filter((v) => v > 0).length / nonBE.length) * 100)
}

// Edge Score — Zella-Score-style composite (0-100) using the researched
// TradeZella component formulas and weights:
//   Profit Factor 25% · Avg Win/Loss 20% · Max Drawdown 20% ·
//   Win % 15% · Recovery Factor 10% · Consistency 10%
export function edgeScore(trades, fees = 0) {
  const s = summaryStats(trades, fees)
  const { recoveryFactor } = drawdownMetrics(trades)

  // 1. Win % score = min(100, (winRate / 60) * 100).
  const winComp = Math.min(100, (s.winRate / 60) * 100)
  // 2. Profit factor (banded).
  const pfComp = bandedRatioScore(s.profitFactor === Infinity ? 3 : s.profitFactor)
  // 3. Avg win / avg loss (banded).
  const ratio = Math.abs(s.avgLoss) > 0 ? s.avgWin / Math.abs(s.avgLoss) : s.avgWin > 0 ? 3 : 0
  const wlComp = bandedRatioScore(ratio)
  // 4. Max drawdown score = 100 − (worst peak-to-trough drop as % of the peak
  //    cumulative P&L it fell from).
  const curve = equityCurve(trades)
  let runPeak = 0
  let worstDrop = 0
  let peakAtWorst = 0
  for (const p of curve) {
    runPeak = Math.max(runPeak, p.value)
    const drop = runPeak - p.value
    if (drop > worstDrop) {
      worstDrop = drop
      peakAtWorst = runPeak
    }
  }
  const ddPct = peakAtWorst > 0 ? Math.min(100, (worstDrop / peakAtWorst) * 100) : worstDrop > 0 ? 100 : 0
  const ddComp = Math.max(0, 100 - ddPct)
  // 5. Recovery factor (banded: >=3.5 → 100 … <1 → 0).
  const rf = recoveryFactor === Infinity ? 4 : Math.max(0, recoveryFactor)
  let rfComp
  if (rf >= 3.5) rfComp = 100
  else if (rf >= 3.0) rfComp = 70 + ((rf - 3.0) / 0.5) * 29
  else if (rf >= 2.5) rfComp = 60 + ((rf - 2.5) / 0.5) * 9
  else if (rf >= 2.0) rfComp = 50 + ((rf - 2.0) / 0.5) * 9
  else rfComp = Math.max(0, (rf / 2.0) * 50)
  // 6. Consistency.
  const consComp = consistencyScore(trades)

  const components = [
    { key: 'winRate', label: 'Win %', value: round2(winComp) },
    { key: 'profitFactor', label: 'Profit factor', value: round2(pfComp) },
    { key: 'winLoss', label: 'Avg win/loss', value: round2(wlComp) },
    { key: 'drawdown', label: 'Max drawdown', value: round2(ddComp) },
    { key: 'recovery', label: 'Recovery factor', value: round2(rfComp) },
    { key: 'consistency', label: 'Consistency', value: round2(consComp) },
  ]
  const weights = { profitFactor: 0.25, winLoss: 0.2, drawdown: 0.2, winRate: 0.15, recovery: 0.1, consistency: 0.1 }
  const score = round2(components.reduce((a, c) => a + c.value * weights[c.key], 0))
  return { score: s.totalTrades ? score : 0, components }
}

// Generic category report: group trades with keyFn (may return one key or an
// array of keys, e.g. a trade's tags) and compute row stats per bucket.
export function reportBy(trades, keyFn) {
  const groups = {}
  for (const t of trades) {
    const keys = keyFn(t)
    for (const k of Array.isArray(keys) ? keys : [keys]) {
      if (k == null || k === '') continue
      ;(groups[k] ||= []).push(t)
    }
  }
  return Object.entries(groups).map(([bucket, ts]) => {
    const s = summaryStats(ts)
    return {
      bucket,
      trades: s.totalTrades,
      netPnl: s.totalPnl,
      winRate: s.winRate,
      avgWin: s.avgWin,
      avgLoss: s.avgLoss,
      expectancy: s.expectancy,
      profitFactor: s.profitFactor,
    }
  })
}

// Side-by-side profile of winning vs losing trades — "what do my winners have
// in common that my losers don't".
export function winsVsLosses(trades) {
  const build = (ts) => {
    if (!ts.length) return null
    const hours = ts.map((t) => hourOfDay(t.date)).filter((h) => h != null)
    const avgHour = hours.length ? Math.round(hours.reduce((a, h) => a + h, 0) / hours.length) : null
    const tagCounts = {}
    for (const t of ts) for (const tag of t.tags || []) tagCounts[tag] = (tagCounts[tag] || 0) + 1
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, n]) => `${tag} (${n})`)
    const rs = ts.map(tradeR).filter((r) => r != null)
    const qualities = ts.filter((t) => t.quality)
    return {
      count: ts.length,
      totalPnl: sumPnl(ts),
      avgPnl: round2(sumPnl(ts) / ts.length),
      avgContracts: round2(ts.reduce((a, t) => a + (Number(t.contracts) || 0), 0) / ts.length),
      avgHour,
      topTags,
      avgR: rs.length ? round2(rs.reduce((a, r) => a + r, 0) / rs.length) : null,
      avgQuality: qualities.length ? round2(qualities.reduce((a, t) => a + Number(t.quality), 0) / qualities.length) : null,
      rulesFollowedPct: round2((ts.filter((t) => !tradeBrokeRules(t)).length / ts.length) * 100),
    }
  }
  return {
    winners: build(trades.filter((t) => (t.pnl || 0) > 0)),
    losers: build(trades.filter((t) => (t.pnl || 0) < 0)),
  }
}

// R-multiple for a trade (needs entry/stop). Positive = made R, negative = lost R.
export function tradeR(t) {
  const e = Number(t.entry)
  const stop = Number(t.stopPrice)
  if (!Number.isFinite(e) || !Number.isFinite(stop) || e === stop) return null
  const ts = Number(t.tickSize) > 0 ? Number(t.tickSize) : 1
  const tv = Number(t.tickValue) || 0
  const c = Number(t.contracts) || 0
  if (!tv || !c) return null
  const riskDollars = (Math.abs(e - stop) / ts) * tv * c
  if (!riskDollars) return null
  return round2((Number(t.pnl) || 0) / riskDollars)
}

// Per-playbook performance (trades carrying playbookId).
export function playbookStats(playbook, trades) {
  const pbTrades = trades.filter((t) => t.playbookId === playbook.id)
  const s = summaryStats(pbTrades)
  const rs = pbTrades.map(tradeR).filter((r) => r != null)
  return {
    ...s,
    avgR: rs.length ? round2(rs.reduce((a, r) => a + r, 0) / rs.length) : null,
    trades: pbTrades,
  }
}
