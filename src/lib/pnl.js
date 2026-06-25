// Futures P&L math. A contract's dollar P&L is:
//   ticks_moved * tickValue * contracts
// where ticks_moved = priceMove / tickSize. tickValue is the $ value of one
// tick, tickSize is the minimum price increment.

export function calcPnl({ direction, contracts, entry, exit, tickValue, tickSize, fees = 0 }) {
  const c = Number(contracts) || 0
  const e = Number(entry)
  const x = Number(exit)
  const tv = Number(tickValue) || 0
  const ts = Number(tickSize) || 0
  if (!Number.isFinite(e) || !Number.isFinite(x) || !c) return 0

  const dir = direction === 'short' ? -1 : 1
  const move = (x - e) * dir
  // If no tick size is given, treat the move as raw points * tickValue.
  const ticks = ts > 0 ? move / ts : move
  const gross = ticks * tv * c
  return round2(gross - (Number(fees) || 0))
}

export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}

// Risk:reward helper given a stop price (optional, used for display only).
export function rMultiple({ direction, entry, exit, stop }) {
  const e = Number(entry)
  const x = Number(exit)
  const s = Number(stop)
  if (!Number.isFinite(e) || !Number.isFinite(x) || !Number.isFinite(s)) return null
  const dir = direction === 'short' ? -1 : 1
  const risk = Math.abs(e - s)
  if (!risk) return null
  const reward = (x - e) * dir
  return round2(reward / risk)
}
