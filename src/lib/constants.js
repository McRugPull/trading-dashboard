// Shared domain constants.

// ── Tags ──────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH. Every tag is defined once here with a `type` and a
// display `group`. Everything else (the trade form, the Trade Log filter, the
// Analytics emotion chart, the rules-broken logic, the calendar) derives from
// these exports — so adding a tag below automatically appears everywhere and is
// classified correctly, with nothing else to update.
//
//   type 'good'  → a strong setup / good habit (does NOT count against rules)
//   type 'setup' → a neutral strategy/context tag (does NOT count against rules)
//   type 'bad'   → a discipline breach (DOES count as a broken rule)
export const TAG_DEFS = [
  // Setups & strategy
  { label: 'SND Setup', type: 'good', group: 'Setups' },
  { label: 'A+ Setup', type: 'good', group: 'Setups' },
  { label: 'Breakout', type: 'setup', group: 'Setups' },
  { label: 'Reversal', type: 'setup', group: 'Setups' },
  { label: 'Trend Continuation', type: 'setup', group: 'Setups' },
  { label: 'Range', type: 'setup', group: 'Setups' },
  { label: 'News', type: 'setup', group: 'Setups' },
  // Execution / good habits
  { label: 'Followed Plan', type: 'good', group: 'Execution' },
  { label: 'Patient Entry', type: 'good', group: 'Execution' },
  { label: 'Took Partial', type: 'good', group: 'Execution' },
  // Mistakes / discipline breaches
  { label: 'Gamble', type: 'bad', group: 'Mistakes' },
  { label: 'Revenge', type: 'bad', group: 'Mistakes' },
  { label: 'FOMO', type: 'bad', group: 'Mistakes' },
  { label: 'Bored', type: 'bad', group: 'Mistakes' },
  { label: 'Overtrading', type: 'bad', group: 'Mistakes' },
  { label: 'Oversized', type: 'bad', group: 'Mistakes' },
  { label: 'Moved Stop', type: 'bad', group: 'Mistakes' },
  { label: 'No Stop Loss', type: 'bad', group: 'Mistakes' },
  { label: 'Chased', type: 'bad', group: 'Mistakes' },
  { label: 'Let Loser Run', type: 'bad', group: 'Mistakes' },
]

// Full literal class strings (kept literal so Tailwind's JIT picks them up).
const TYPE_STYLE = {
  good: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300',
  setup: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-300',
  bad: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-300',
}

export const TAGS = TAG_DEFS.map((t) => t.label)
export const BAD_TAGS = TAG_DEFS.filter((t) => t.type === 'bad').map((t) => t.label)
export const GOOD_TAGS = TAG_DEFS.filter((t) => t.type !== 'bad').map((t) => t.label)

// label → tailwind classes (derived from type)
export const TAG_STYLES = Object.fromEntries(TAG_DEFS.map((t) => [t.label, TYPE_STYLE[t.type]]))

// Grouped for the trade form UI, in definition order.
export const TAG_GROUPS = ['Setups', 'Execution', 'Mistakes'].map((name) => ({
  name,
  tags: TAG_DEFS.filter((t) => t.group === name).map((t) => t.label),
}))

// ── Pre-trade checklist ─────────────────────────────────────────────────────
// A trade may only be logged once every item is checked.
export const CHECKLIST_ITEMS = [
  { id: 'snd', label: 'SND zone identified', hint: 'Supply/Demand zone marked on the chart.' },
  { id: 'fib', label: 'Fib confluence', hint: 'Price aligns with a key Fibonacci level.' },
  { id: 'session', label: 'Morning session only', hint: 'Within your highest-probability trading window.' },
  { id: 'confirmation', label: 'Confirmation candle waited', hint: 'Did not front-run; waited for the signal candle.' },
  { id: 'nofomo', label: 'No FOMO entry', hint: 'Not chasing — entering at a planned level.' },
  { id: 'risk', label: 'Risk defined', hint: 'Stop loss and position size set before entry.' },
]

// ── Instruments ─────────────────────────────────────────────────────────────
// Seed instruments (common CME futures). Users can add/remove their own.
// tickValue = $ per tick, tickSize = price increment per tick.
export const DEFAULT_INSTRUMENTS = [
  { symbol: 'ES', name: 'E-mini S&P 500', tickValue: 12.5, tickSize: 0.25 },
  { symbol: 'MES', name: 'Micro E-mini S&P 500', tickValue: 1.25, tickSize: 0.25 },
  { symbol: 'NQ', name: 'E-mini Nasdaq 100', tickValue: 5, tickSize: 0.25 },
  { symbol: 'MNQ', name: 'Micro E-mini Nasdaq 100', tickValue: 0.5, tickSize: 0.25 },
  { symbol: 'GC', name: 'Gold', tickValue: 10, tickSize: 0.1 },
  { symbol: 'CL', name: 'Crude Oil', tickValue: 10, tickSize: 0.01 },
]

export const QUALITY_LABELS = {
  1: 'Poor',
  2: 'Weak',
  3: 'Okay',
  4: 'Good',
  5: 'A+',
}
