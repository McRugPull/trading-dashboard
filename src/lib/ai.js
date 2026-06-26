// AI Insights — calls the Anthropic Messages API directly from the browser.
//
// SECURITY NOTE: calling Anthropic from the browser requires the
// `anthropic-dangerous-direct-browser-access` header and exposes your API key
// to anyone who can read this page's network traffic or localStorage. This is
// acceptable for a personal, single-user dashboard you host yourself, but you
// should use a key with strict spend limits and never deploy it on a shared or
// public machine. For anything multi-user, proxy through a backend instead.

import { TAGS } from './constants'
import {
  summaryStats,
  rulesVsPnl,
  emotionVsPnl,
  winLossByHour,
  instrumentBreakdown,
  rulesStreak,
} from './analytics'
import { round2 } from './pnl'

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an elite trading performance coach reviewing a discretionary futures trader's REAL trade data — hard numbers, not vibes. The trader uses a Supply & Demand (SND) method with Fibonacci confluence and trades primarily the morning session. Behavioural tags marked "(mistake)" are discipline breaches; the rest are setups/good habits.

Your single job: find where this trader is actually losing money and tell them exactly what to change. Be the sharp coach who looked at the numbers, not a fortune cookie.

NON-NEGOTIABLE RULES:
- Ground EVERY claim in the specific numbers provided. Quote the actual figures ($, %, counts). If you can't tie a point to a number, cut it.
- Lead with the single biggest leak in DOLLAR terms — the tag, time-of-day, or instrument cohort that is bleeding the most money — and name the exact damage.
- BANNED unless tied to a specific number and a specific action: "manage your risk", "stay disciplined", "cut your losses", "be patient", "trust your process", "control your emotions". Generic advice is a failure.
- If the sample is small (under ~15 trades) say so plainly and give only provisional observations — do not over-read noise.
- Compare cohorts the trader can act on (rules-followed vs broken, best vs worst hour, by tag). Quantify the gap.
- Be direct and concise. Specific beats comprehensive.

Respond in markdown with exactly these sections:
## Bottom line
(1–2 sentences: the most important finding, with the number.)
## What's working
(Only what the data supports — cite figures. If nothing yet, say so.)
## Your biggest leak
(The costliest pattern in dollars: name the tag/time/instrument and the exact damage, e.g. "Your 11 FOMO trades averaged −$84 and cost you −$924 total.")
## Fix this now
(2–3 concrete, specific changes tied directly to the data above.)

Keep it under ~350 words. End with ONE sentence: the single habit to change this week.`

export async function generateInsights({ apiKey, summary }) {
  if (!apiKey) throw new Error('No API key set. Add your Anthropic API key in the field above.')

  const userContent =
    'Here is my trading data as JSON (all P&L in USD). Analyse it and coach me — cite my actual numbers.\n\n```json\n' +
    JSON.stringify(summary, null, 2) +
    '\n```'

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    })
  } catch (e) {
    throw new Error('Network error reaching the Anthropic API. Check your connection and that the key is valid.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const err = await res.json()
      detail = err?.error?.message || ''
    } catch (e) {
      /* ignore parse error */
    }
    if (res.status === 401) throw new Error('Invalid API key (401). Double-check the key you pasted.')
    if (res.status === 429) throw new Error('Rate limited (429). Wait a moment and try again.')
    throw new Error(`API error ${res.status}${detail ? ': ' + detail : ''}`)
  }

  const data = await res.json()
  if (data.stop_reason === 'refusal') {
    throw new Error('The model declined to respond to this request.')
  }
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
  return text || 'No response text returned.'
}

// Build a rich, privacy-respecting numeric summary so the model can be specific.
// (No screenshots, no journal prose — just figures and tags.)
export function buildSummary({ trades }) {
  const overall = summaryStats(trades)
  const rules = rulesVsPnl(trades)

  // Which behaviours cost the most money? (only tags that were actually used)
  const byTag = emotionVsPnl(trades, TAGS)
    .map((t) => ({ tag: t.tag, trades: t.count, avgPnl: t.avgPnl, totalPnl: t.totalPnl }))
    .sort((a, b) => a.totalPnl - b.totalPnl) // worst first

  // Best / worst trading hour by net P&L.
  const hours = winLossByHour(trades).map((h) => ({
    hour: `${h.hour}:00`,
    trades: h.wins + h.losses,
    wins: h.wins,
    losses: h.losses,
    netPnl: h.pnl,
  }))
  const sortedHours = [...hours].sort((a, b) => b.netPnl - a.netPnl)

  const byInstrument = instrumentBreakdown(trades).map((i) => ({
    instrument: i.instrument,
    trades: i.count,
    netPnl: i.pnl,
  }))

  const recentTrades = trades
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30)
    .map((t) => ({
      date: t.date,
      instrument: t.instrument,
      direction: t.direction,
      contracts: t.contracts,
      pnl: t.pnl,
      tags: t.tags,
      quality: t.quality,
      rulesFollowed: t.rulesFollowed,
    }))

  return {
    sampleSize: overall.totalTrades,
    overall: {
      netPnl: overall.totalPnl,
      winRatePct: overall.winRate,
      wins: overall.wins,
      losses: overall.losses,
      avgWin: overall.avgWin,
      avgLoss: overall.avgLoss,
      profitFactor: overall.profitFactor === Infinity ? 'all wins (no losses yet)' : overall.profitFactor,
      expectancyPerTrade: overall.expectancy,
      bestTrade: overall.bestTrade,
      worstTrade: overall.worstTrade,
      avgQuality1to5: overall.avgQuality,
    },
    discipline: {
      currentCleanStreakDays: rulesStreak(trades),
      rulesFollowedPct: overall.rulesFollowedPct,
      rulesFollowedTrades: rules.followedCount,
      rulesFollowedAvgPnl: rules.followedAvg,
      rulesFollowedTotalPnl: rules.followedTotal,
      rulesBrokenTrades: rules.brokenCount,
      rulesBrokenAvgPnl: rules.brokenAvg,
      rulesBrokenTotalPnl: rules.brokenTotal,
      costOfBrokenRules: round2(rules.brokenTotal), // negative = money lost on undisciplined trades
    },
    byTag,
    byInstrument,
    byHour: hours,
    bestHour: sortedHours[0] || null,
    worstHour: sortedHours[sortedHours.length - 1] || null,
    recentTrades,
  }
}
