// Prop-firm account presets — researched & cross-checked from firm sites and
// reputable comparison sources (mid-2026). Picking a preset in the Accounts page
// auto-fills the account's rules. RULES CHANGE OFTEN — always verify the current
// figures on the firm's website before relying on them.
//
// drawdownType:
//   'trailing-intraday' → max-loss trails your real-time equity peak (incl. open P&L)
//   'trailing-eod'      → max-loss trails your end-of-day balance, usually locks at start
//   'static'            → fixed floor that never moves
// drawdownAmount = max trailing drawdown / max loss limit ($)
// dailyLossLimit = daily loss limit ($) or null if none

export const DRAWDOWN_TYPE_LABELS = {
  'trailing-intraday': 'Trailing · intraday',
  'trailing-eod': 'Trailing · end-of-day',
  static: 'Static',
  unknown: 'Unknown',
}

export const PROP_DISCLAIMER =
  'Reference defaults compiled mid-2026. Prop-firm rules, prices, and limits change frequently — verify current figures on the firm’s official site.'

export const PROP_FIRMS = [
  {
    firm: 'Lucid Trading',
    plans: [
      { plan: 'LucidFlex 25K', accountSize: 25000, drawdownType: 'trailing-eod', drawdownAmount: 1000, profitTarget: 1250, dailyLossLimit: null, maxContracts: 2, notes: 'Single-phase, EOD trailing DD, no DLL. 50% consistency during eval. 90/10 split.' },
      { plan: 'LucidFlex 50K', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: null, maxContracts: 4, notes: 'EOD trailing DD, no DLL (key difference vs LucidPro). 50% consistency during eval.' },
      { plan: 'LucidFlex 100K', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 6, notes: 'EOD trailing DD, no DLL. 50% consistency during eval.' },
      { plan: 'LucidFlex 150K', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: null, maxContracts: 10, notes: 'EOD trailing DD, no DLL. 50% consistency during eval.' },
      { plan: 'LucidPro 25K', accountSize: 25000, drawdownType: 'trailing-eod', drawdownAmount: 1000, profitTarget: 1250, dailyLossLimit: null, maxContracts: 2, notes: 'EOD trailing MLL (updates ~4:45pm ET), no DLL on 25K. No consistency rule. 90/10 split.' },
      { plan: 'LucidPro 50K', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: 1200, maxContracts: 4, notes: 'EOD trailing MLL + intraday DLL (~$1,200, verify). No consistency rule.' },
      { plan: 'LucidPro 100K', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: 1800, maxContracts: 6, notes: 'EOD trailing MLL + intraday DLL ~$1,800. No consistency rule. $500 payout min.' },
      { plan: 'LucidPro 150K', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: 2700, maxContracts: 10, notes: 'EOD trailing MLL + intraday DLL ~$2,700. No consistency rule.' },
    ],
  },
  {
    firm: 'Apex Trader Funding',
    plans: [
      { plan: '25K Evaluation', accountSize: 25000, drawdownType: 'trailing-eod', drawdownAmount: 1000, profitTarget: 1500, dailyLossLimit: null, maxContracts: 4, notes: 'EOD or intraday trail option (intraday has no DLL). No eval consistency rule. Payout: 5 days, 50% consistency.' },
      { plan: '50K Evaluation', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: null, maxContracts: 6, notes: 'EOD or intraday trail option. No eval consistency rule. 30-day access.' },
      { plan: '100K Evaluation', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 8, notes: 'EOD or intraday trail option. No eval consistency rule.' },
      { plan: '150K Evaluation', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4000, profitTarget: 9000, dailyLossLimit: null, maxContracts: 12, notes: 'EOD or intraday trail option. Funded scales ~9-10 contracts.' },
    ],
  },
  {
    firm: 'Topstep',
    plans: [
      { plan: '50K Trading Combine', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: 1000, maxContracts: 5, notes: 'MLL trails EOD, locks static at start. Consistency: best day < 50% of target. $149 activation on funded.' },
      { plan: '100K Trading Combine', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: 2000, maxContracts: 10, notes: 'MLL trails EOD, locks at start. Consistency: best day < 50% of target. $149 activation on funded.' },
      { plan: '150K Trading Combine', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: 3000, maxContracts: 15, notes: 'MLL trails EOD, locks at start. Consistency: best day < 50% of target. $149 activation on funded.' },
    ],
  },
  {
    firm: 'Take Profit Trader',
    plans: [
      { plan: '25K Test', accountSize: 25000, drawdownType: 'trailing-eod', drawdownAmount: 1500, profitTarget: 1500, dailyLossLimit: null, maxContracts: 3, notes: 'EOD trailing DD. 50% consistency. 5 min trading days. Funded switches to intraday trail, 80/20 split.' },
      { plan: '50K Test', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: null, maxContracts: 6, notes: 'EOD trailing DD. 50% consistency. 5 min trading days. Funded → intraday trail.' },
      { plan: '75K Test', accountSize: 75000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 4500, dailyLossLimit: null, maxContracts: 9, notes: 'EOD trailing DD. 50% consistency. 5 min trading days.' },
      { plan: '100K Test', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 4000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 12, notes: 'EOD trailing DD. 50% consistency. 5 min trading days.' },
      { plan: '150K Test', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: null, maxContracts: 15, notes: 'EOD trailing DD. 50% consistency. 5 min trading days.' },
    ],
  },
  {
    firm: 'MyFundedFutures',
    plans: [
      { plan: 'Rapid 50K', accountSize: 50000, drawdownType: 'trailing-intraday', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: null, maxContracts: 5, notes: '4% intraday trailing DD, locks at +$100. 50% consistency (eval only). No DLL.' },
      { plan: 'Rapid 100K', accountSize: 100000, drawdownType: 'trailing-intraday', drawdownAmount: 4000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 10, notes: '4% intraday trailing DD. 50% consistency (eval only). No DLL.' },
      { plan: 'Rapid 150K', accountSize: 150000, drawdownType: 'trailing-intraday', drawdownAmount: 6000, profitTarget: 9000, dailyLossLimit: null, maxContracts: 15, notes: '4% intraday trailing DD. 50% consistency (eval only). No DLL.' },
      { plan: 'Pro 50K', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 1500, profitTarget: 3000, dailyLossLimit: null, maxContracts: 5, notes: '3% EOD trailing DD. Full size on funding, no consistency on funded. No DLL.' },
      { plan: 'Pro 100K', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 10, notes: '3% EOD trailing DD. Full size on funding. No DLL.' },
      { plan: 'Pro 150K', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: null, maxContracts: 15, notes: '3% EOD trailing DD. Full size on funding. No DLL.' },
    ],
  },
  {
    firm: 'Tradeify',
    plans: [
      { plan: 'Growth 25K', accountSize: 25000, drawdownType: 'trailing-eod', drawdownAmount: 1000, profitTarget: 1500, dailyLossLimit: 600, maxContracts: 1, notes: 'EOD trailing DD, locks static. $600 DLL. 35% consistency on funded. 1-day pass possible.' },
      { plan: 'Growth 50K', accountSize: 50000, drawdownType: 'trailing-eod', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: 1200, maxContracts: 3, notes: 'EOD trailing DD, locks static. ~$1,200 DLL (verify). 35% consistency on funded.' },
      { plan: 'Growth 100K', accountSize: 100000, drawdownType: 'trailing-eod', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: 2000, maxContracts: 5, notes: 'EOD trailing DD, locks static. $2,000 DLL. 35% consistency on funded.' },
      { plan: 'Growth 150K', accountSize: 150000, drawdownType: 'trailing-eod', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: 3000, maxContracts: 10, notes: 'EOD trailing DD. $3,000 DLL. 35% consistency on funded.' },
    ],
  },
  {
    firm: 'Bulenox',
    plans: [
      { plan: '25K (No Scaling)', accountSize: 25000, drawdownType: 'trailing-intraday', drawdownAmount: 1500, profitTarget: 1500, dailyLossLimit: null, maxContracts: 3, notes: 'Real-time trailing DD incl. open P&L, full contracts day one, no DLL. 40% consistency at payout.' },
      { plan: '50K (No Scaling)', accountSize: 50000, drawdownType: 'trailing-intraday', drawdownAmount: 2500, profitTarget: 3000, dailyLossLimit: null, maxContracts: 7, notes: 'Real-time trailing DD, full 7 contracts day one, no DLL. 40% consistency at payout.' },
      { plan: '100K (No Scaling)', accountSize: 100000, drawdownType: 'trailing-intraday', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 12, notes: 'Real-time trailing DD, full 12 contracts day one, no DLL. 40% consistency at payout.' },
      { plan: '150K (No Scaling)', accountSize: 150000, drawdownType: 'trailing-intraday', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: null, maxContracts: 15, notes: 'Real-time trailing DD, full 15 contracts day one, no DLL. 40% consistency at payout.' },
      { plan: '250K (No Scaling)', accountSize: 250000, drawdownType: 'trailing-intraday', drawdownAmount: 5500, profitTarget: 15000, dailyLossLimit: null, maxContracts: 25, notes: 'Real-time trailing DD, full 25 contracts day one, no DLL. 40% consistency; weekly Wed payouts.' },
    ],
  },
  {
    firm: 'TradeDay',
    plans: [
      { plan: '50K Quick Pay', accountSize: 50000, drawdownType: 'trailing-intraday', drawdownAmount: 2000, profitTarget: 3000, dailyLossLimit: null, maxContracts: 5, notes: '1-step eval. Intraday trailing DD incl. open P&L. 30% consistency (eval only). 5 min days. No DLL.' },
      { plan: '100K Quick Pay', accountSize: 100000, drawdownType: 'trailing-intraday', drawdownAmount: 3000, profitTarget: 6000, dailyLossLimit: null, maxContracts: 10, notes: 'Intraday trailing DD. 30% consistency (eval only). 5 min days. No DLL. 80% split rising to 95%.' },
      { plan: '150K Quick Pay', accountSize: 150000, drawdownType: 'trailing-intraday', drawdownAmount: 4500, profitTarget: 9000, dailyLossLimit: null, maxContracts: 15, notes: 'Intraday trailing DD. 30% consistency (eval only). 5 min days. No DLL. Day-one payouts.' },
    ],
  },
]

export function findPlan(firmName, planName) {
  const f = PROP_FIRMS.find((x) => x.firm === firmName)
  if (!f) return null
  return f.plans.find((p) => p.plan === planName) || null
}
