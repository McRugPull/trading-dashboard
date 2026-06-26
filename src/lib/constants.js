// Shared domain constants.

// ── Tags ──────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH. Two categories only: a TRADE TYPE (the kind of setup)
// and an EMOTION (how you felt). Everything else — the trade form, the Trade Log
// filter, the Analytics charts, the rules-broken logic, the calendar — derives
// from the exports below, so changing a tag here updates the whole app.
//
//   type 'type' → a kind of trade/setup (neutral; never counts against rules)
//   type 'good' → a positive emotion (never counts against rules)
//   type 'bad'  → a negative/undisciplined emotion (DOES count as a broken rule)
export const TAG_DEFS = [
  // Trade type — the kind of setup
  { label: 'SND Setup', type: 'type', group: 'Trade Type' },
  { label: 'Breakout', type: 'type', group: 'Trade Type' },
  { label: 'Reversal', type: 'type', group: 'Trade Type' },
  { label: 'Trend Continuation', type: 'type', group: 'Trade Type' },
  { label: 'Range', type: 'type', group: 'Trade Type' },
  { label: 'News', type: 'type', group: 'Trade Type' },
  // Emotion — positive
  { label: 'Calm', type: 'good', group: 'Emotion' },
  { label: 'Confident', type: 'good', group: 'Emotion' },
  { label: 'Patient', type: 'good', group: 'Emotion' },
  // Emotion — negative (counts against your rules-followed streak)
  { label: 'FOMO', type: 'bad', group: 'Emotion' },
  { label: 'Revenge', type: 'bad', group: 'Emotion' },
  { label: 'Greedy', type: 'bad', group: 'Emotion' },
  { label: 'Anxious', type: 'bad', group: 'Emotion' },
  { label: 'Bored', type: 'bad', group: 'Emotion' },
]

// Full literal class strings (kept literal so Tailwind's JIT picks them up).
const TYPE_STYLE = {
  type: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-300',
  good: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300',
  bad: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-300',
}

export const TAGS = TAG_DEFS.map((t) => t.label)
export const BAD_TAGS = TAG_DEFS.filter((t) => t.type === 'bad').map((t) => t.label)
export const GOOD_TAGS = TAG_DEFS.filter((t) => t.type !== 'bad').map((t) => t.label)

// Tags split by category (used to keep the Analytics "emotion" chart honest).
export const TYPE_TAGS = TAG_DEFS.filter((t) => t.group === 'Trade Type').map((t) => t.label)
export const EMOTION_TAGS = TAG_DEFS.filter((t) => t.group === 'Emotion').map((t) => t.label)

// label → tailwind classes (derived from type)
export const TAG_STYLES = Object.fromEntries(TAG_DEFS.map((t) => [t.label, TYPE_STYLE[t.type]]))

// Grouped for the trade form UI, in definition order.
export const TAG_GROUPS = ['Trade Type', 'Emotion'].map((name) => ({
  name,
  tags: TAG_DEFS.filter((t) => t.group === name).map((t) => t.label),
}))

// ── Pre-trade checklist ─────────────────────────────────────────────────────
// A trade may only be logged once every item is checked.
// Ordered top-to-bottom = the real entry sequence (first check → trigger).
// Session-level checks (daily-loss buffer, morning window, news) are run once at
// the open, not on every trade, so they live outside this per-setup gate.
export const CHECKLIST_ITEMS = [
  {
    id: 'htf-bias',
    label: 'HTF bias defined — trading with it',
    hint: 'Mark daily/4H structure (HH-HL = bullish, LH-LL = bearish). One bias word, and this trade goes with it.',
  },
  {
    id: 'snd-zone-holding',
    label: 'Valid SND zone showing rejection / holding',
    hint: 'Fresh, unmitigated zone at a Break-of-Structure origin — and price is reacting off it (rejection / hold), not slicing through.',
  },
  {
    id: 'fib-golden-retrace',
    label: 'Fib set on the swing — retraced into the golden zone',
    hint: 'On the swing high/low, draw the fib over the impulse leg; price pulling back into the 0.62–0.79 OTE / golden zone (0.705 ideal).',
  },
  {
    id: 'ltf-bos-confirm',
    label: 'LTF confirmation — BOS / CHoCH in my direction',
    hint: 'Drop to 5m/1m: a candle BODY closes past the swing (a real break of structure), not just a wick.',
  },
  {
    id: 'stop-set',
    label: 'Proper stop set at invalidation',
    hint: 'Hard stop resting in the platform just beyond the zone / swept extreme — the price that proves the idea wrong.',
  },
  {
    id: 'tp-rr',
    label: 'Proper TP set — R:R worth it',
    hint: 'Target at the next HTF liquidity/structure; reward is at least ~2× the risk before you take it.',
  },
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
