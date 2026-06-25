// Shared domain constants.

// Trade tags. "SND Setup" is the only "good" tag — the rest flag undisciplined
// behaviour and count against the rules-followed streak.
export const TAGS = ['SND Setup', 'Gamble', 'Revenge', 'FOMO', 'Bored']
export const GOOD_TAGS = ['SND Setup']
export const BAD_TAGS = ['Gamble', 'Revenge', 'FOMO', 'Bored']

export const TAG_STYLES = {
  'SND Setup':
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300',
  Gamble:
    'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300',
  Revenge:
    'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-300',
  FOMO:
    'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/60 dark:bg-orange-900/30 dark:text-orange-300',
  Bored:
    'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-900/30 dark:text-violet-300',
}

// Pre-trade checklist. A trade may only be logged once every item is checked.
export const CHECKLIST_ITEMS = [
  { id: 'snd', label: 'SND zone identified', hint: 'Supply/Demand zone marked on the chart.' },
  { id: 'fib', label: 'Fib confluence', hint: 'Price aligns with a key Fibonacci level.' },
  { id: 'session', label: 'Morning session only', hint: 'Within your highest-probability trading window.' },
  { id: 'confirmation', label: 'Confirmation candle waited', hint: 'Did not front-run; waited for the signal candle.' },
  { id: 'nofomo', label: 'No FOMO entry', hint: 'Not chasing — entering at a planned level.' },
  { id: 'risk', label: 'Risk defined', hint: 'Stop loss and position size set before entry.' },
]

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
