// AI Insights — calls the Anthropic Messages API directly from the browser.
//
// SECURITY NOTE: calling Anthropic from the browser requires the
// `anthropic-dangerous-direct-browser-access` header and exposes your API key
// to anyone who can read this page's network traffic or localStorage. This is
// acceptable for a personal, single-user dashboard you host yourself, but you
// should use a key with strict spend limits and never deploy it on a shared or
// public machine. For anything multi-user, proxy through a backend instead.

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an elite trading performance coach reviewing a discretionary futures trader's journal.
The trader uses a Supply & Demand (SND) methodology with Fibonacci confluence and trades primarily the morning session.
They track behavioural tags: "SND Setup" is their A+ process; "Gamble", "Revenge", "FOMO", and "Bored" are discipline breaches.

Analyse the data provided and respond with SPECIFIC, actionable coaching. Be direct and concrete — reference the actual
numbers. Structure your response in short markdown sections with these headings:

## What's working
## What's hurting you
## Patterns in the data
## This week's focus

Rules:
- Ground every claim in the numbers given. Do not invent data.
- Prioritise behaviour and risk over prediction. Never give buy/sell signals or market forecasts.
- Keep it under ~400 words. Use bullet points. End with one single most-important habit to fix.`

export async function generateInsights({ apiKey, summary }) {
  if (!apiKey) throw new Error('No API key set. Add your Anthropic API key in the field above.')

  const userContent =
    'Here is my trading data as JSON. Analyse it and coach me.\n\n```json\n' +
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
        max_tokens: 1500,
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

// Build a compact, privacy-respecting summary of the trader's data to send.
// (No screenshots, no journal prose — just numbers and tags.)
export function buildSummary({ trades, stats }) {
  const recent = trades
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 40)
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
  return { ...stats, recentTrades: recent }
}
