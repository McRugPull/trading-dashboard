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

// Headline stats for a set of trades.
export function summaryStats(trades) {
  const total = trades.length
  const wins = trades.filter((t) => (t.pnl || 0) > 0)
  const losses = trades.filter((t) => (t.pnl || 0) < 0)
  const grossWin = sumPnl(wins)
  const grossLoss = sumPnl(losses) // negative
  const totalPnl = round2(grossWin + grossLoss)
  const followed = trades.filter((t) => !tradeBrokeRules(t))
  const qualityRated = trades.filter((t) => t.quality)

  return {
    totalTrades: total,
    wins: wins.length,
    losses: losses.length,
    breakeven: total - wins.length - losses.length,
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

// Per-account balance & drawdown derived from that account's assigned trades.
// Models a trailing drawdown: the floor trails the equity high-water mark.
export function accountStats(account, trades) {
  const start = Number(account.startingBalance) || 0
  const limit = Number(account.drawdownLimit) || 0
  const accTrades = byDateAsc(trades.filter((t) => t.accountId === account.id))

  let bal = start
  let hwm = start
  for (const t of accTrades) {
    bal = round2(bal + (Number(t.pnl) || 0))
    hwm = Math.max(hwm, bal)
  }
  const floor = round2(hwm - limit)
  const drawdownUsed = round2(hwm - bal) // >= 0, how far below the peak
  const remaining = round2(bal - floor) // = limit - drawdownUsed
  const usedPct = limit > 0 ? Math.min(100, Math.max(0, round2((drawdownUsed / limit) * 100))) : 0

  return {
    currentBalance: bal,
    highWaterMark: hwm,
    floor,
    drawdownUsed,
    remaining,
    usedPct,
    tradeCount: accTrades.length,
    netPnl: round2(bal - start),
  }
}
