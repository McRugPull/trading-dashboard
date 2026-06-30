import { useState } from 'react'
import { useData } from '../context/DataContext'
import { Card, PageHeader, Meter, Modal, EmptyState, ConfirmButton } from '../components/ui'
import { PlusIcon, WalletIcon, EditIcon } from '../components/Icons'
import { money, money0, signedMoney, pnlColor, pct } from '../lib/format'
import { PROP_FIRMS, findPlan, DRAWDOWN_TYPE_LABELS, PROP_DISCLAIMER } from '../lib/propFirms'

const blank = {
  name: '',
  firm: '',
  plan: '',
  phase: 'eval',
  startingBalance: 50000,
  drawdownLimit: 2000,
  drawdownType: 'trailing-eod',
  dailyLossLimit: '',
  profitTarget: 0,
  maxContracts: 0,
  notes: '',
}

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, accountStats } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function openNew() {
    setEditing(null)
    setForm(blank)
    setOpen(true)
  }
  function openEdit(acc) {
    setEditing(acc.id)
    setForm({
      name: acc.name,
      firm: acc.firm || '',
      plan: acc.plan || '',
      phase: acc.phase || 'eval',
      startingBalance: acc.startingBalance,
      drawdownLimit: acc.drawdownLimit,
      drawdownType: acc.drawdownType || 'trailing-eod',
      dailyLossLimit: acc.dailyLossLimit ?? '',
      profitTarget: acc.profitTarget || 0,
      maxContracts: acc.maxContracts || 0,
      notes: acc.notes || '',
    })
    setOpen(true)
  }

  // Choosing a firm + plan auto-fills the rule fields.
  function applyPreset(firm, plan) {
    const p = findPlan(firm, plan)
    if (!p) return set({ firm, plan })
    set({
      firm,
      plan,
      name: `${firm.split(' ')[0]} ${plan}`,
      startingBalance: p.accountSize,
      drawdownLimit: p.drawdownAmount,
      drawdownType: p.drawdownType,
      dailyLossLimit: p.dailyLossLimit ?? '',
      profitTarget: p.profitTarget,
      maxContracts: p.maxContracts,
      notes: p.notes,
    })
  }

  function submit(e) {
    e.preventDefault()
    const payload = {
      name: form.name.trim() || 'Account',
      firm: form.firm,
      plan: form.plan,
      phase: form.phase,
      startingBalance: Number(form.startingBalance) || 0,
      drawdownLimit: Number(form.drawdownLimit) || 0,
      drawdownType: form.drawdownType,
      dailyLossLimit: form.dailyLossLimit === '' ? null : Number(form.dailyLossLimit),
      profitTarget: Number(form.profitTarget) || 0,
      maxContracts: Number(form.maxContracts) || 0,
      notes: form.notes,
    }
    if (editing) updateAccount(editing, payload)
    else addAccount(payload)
    setOpen(false)
  }

  const firmPlans = PROP_FIRMS.find((f) => f.firm === form.firm)?.plans || []

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Track each funded account, its rules, and how close you are to the line."
        actions={
          <button className="btn-primary" onClick={openNew}>
            <PlusIcon className="h-4 w-4" /> Add account
          </button>
        }
      />

      {accounts.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No accounts yet"
          message="Add a funded or evaluation account — pick your prop firm and plan and the rules fill in automatically."
          action={
            <button className="btn-primary" onClick={openNew}>
              <PlusIcon className="h-4 w-4" /> Add your first account
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((acc) => {
            const s = accountStats(acc)
            const breached = s.remaining <= 0
            const isEval = (acc.phase || 'eval') === 'eval'
            return (
              <Card key={acc.id} className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                      <span
                        className={`chip ${
                          isEval
                            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}
                      >
                        {isEval ? 'Evaluation' : 'Funded'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {acc.firm ? `${acc.firm}${acc.plan ? ` · ${acc.plan}` : ''} · ` : ''}
                      {s.tradeCount} trade{s.tradeCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(acc)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-neutral-700 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
                  >
                    <EditIcon className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                {/* Balance + P&L */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-neutral-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
                    <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{money0(s.currentBalance)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-neutral-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Net P&L</p>
                    <p className={`text-xl font-bold tabular-nums ${pnlColor(s.netPnl)}`}>{signedMoney(s.netPnl)}</p>
                  </div>
                </div>

                {/* Drawdown */}
                <div>
                  <Meter
                    value={s.usedPct}
                    max={100}
                    label={`Drawdown used · ${DRAWDOWN_TYPE_LABELS[acc.drawdownType] || 'Trailing'}`}
                    valueLabel={`${pct(s.usedPct)} of ${money0(acc.drawdownLimit)}`}
                    dangerHigh
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Floor: <span className="font-medium text-slate-700 dark:text-slate-200">{money0(s.floor)}</span>
                    </span>
                    <span className={breached ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}>
                      {breached ? 'Breached!' : `${money(s.remaining)} buffer`}
                    </span>
                  </div>
                </div>

                {/* Profit target progress (eval only) */}
                {isEval && s.profitTarget > 0 && (
                  <div>
                    <Meter
                      value={s.profitProgressPct}
                      max={100}
                      label="Profit target"
                      valueLabel={`${money0(s.netPnl)} / ${money0(s.profitTarget)}`}
                      dangerHigh={false}
                    />
                    {s.targetReached && (
                      <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Profit target reached</p>
                    )}
                  </div>
                )}

                {/* Rule chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <RulePill label="Max DD" value={money0(acc.drawdownLimit)} />
                  <RulePill label="Daily loss" value={acc.dailyLossLimit ? money0(acc.dailyLossLimit) : 'None'} />
                  {acc.maxContracts > 0 && <RulePill label="Max contracts" value={acc.maxContracts} />}
                  {acc.profitTarget > 0 && <RulePill label="Target" value={money0(acc.profitTarget)} />}
                </div>

                {acc.notes && <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{acc.notes}</p>}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
                  <span className="text-xs text-slate-400">High-water mark {money0(s.highWaterMark)}</span>
                  <ConfirmButton
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:border-rose-400 hover:bg-rose-50 dark:border-neutral-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    confirmLabel="Delete?"
                    onConfirm={() => deleteAccount(acc.id)}
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-slate-400">
        Drawdown is computed from trades assigned to each account (set the account on a trade in the Trade Log). {PROP_DISCLAIMER}
      </p>

      {/* Add / Edit modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit account' : 'Add account'} maxWidth="max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          {/* Preset picker */}
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-500/20 dark:bg-brand-950/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Prop firm preset (auto-fills the rules)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={form.firm}
                onChange={(e) => set({ firm: e.target.value, plan: '' })}
              >
                <option value="">Custom / no firm</option>
                {PROP_FIRMS.map((f) => (
                  <option key={f.firm} value={f.firm}>
                    {f.firm}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={form.plan}
                onChange={(e) => applyPreset(form.firm, e.target.value)}
                disabled={!form.firm}
              >
                <option value="">{form.firm ? 'Select a plan…' : '—'}</option>
                {firmPlans.map((p) => (
                  <option key={p.plan} value={p.plan}>
                    {p.plan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Account name</label>
              <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Lucid LucidFlex 50K" />
            </div>
            <div>
              <label className="label">Phase</label>
              <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-neutral-700">
                {[
                  ['eval', 'Evaluation'],
                  ['funded', 'Funded'],
                ].map(([v, lbl]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set({ phase: v })}
                    className={`flex-1 py-2 text-sm font-semibold transition ${
                      form.phase === v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 dark:bg-neutral-800 dark:text-slate-300'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Drawdown type</label>
              <select className="input" value={form.drawdownType} onChange={(e) => set({ drawdownType: e.target.value })}>
                <option value="trailing-intraday">Trailing · intraday</option>
                <option value="trailing-eod">Trailing · end-of-day</option>
                <option value="static">Static</option>
              </select>
            </div>
            <div>
              <label className="label">Starting balance ($)</label>
              <input type="number" className="input" value={form.startingBalance} onChange={(e) => set({ startingBalance: e.target.value })} />
            </div>
            <div>
              <label className="label">Max drawdown ($)</label>
              <input type="number" className="input" value={form.drawdownLimit} onChange={(e) => set({ drawdownLimit: e.target.value })} />
            </div>
            <div>
              <label className="label">Daily loss limit ($)</label>
              <input type="number" className="input" value={form.dailyLossLimit} onChange={(e) => set({ dailyLossLimit: e.target.value })} placeholder="none" />
            </div>
            <div>
              <label className="label">Profit target ($)</label>
              <input type="number" className="input" value={form.profitTarget} onChange={(e) => set({ profitTarget: e.target.value })} placeholder="0 = none" />
            </div>
            <div>
              <label className="label">Max contracts</label>
              <input type="number" className="input" value={form.maxContracts} onChange={(e) => set({ maxContracts: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes / rules</label>
              <textarea
                className="input min-h-[60px] resize-y text-sm"
                value={form.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Consistency rule, payout terms, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Add account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function RulePill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-neutral-800">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </span>
  )
}
