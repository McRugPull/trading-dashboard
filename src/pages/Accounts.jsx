import { useState } from 'react'
import { useData } from '../context/DataContext'
import { Card, PageHeader, Meter, Modal, EmptyState, ConfirmButton } from '../components/ui'
import { PlusIcon, WalletIcon, EditIcon } from '../components/Icons'
import { money, money0, signedMoney, pnlColor, pct } from '../lib/format'

const blank = { name: '', startingBalance: 50000, drawdownLimit: 2000 }

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, accountStats } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)

  function openNew() {
    setEditing(null)
    setForm(blank)
    setOpen(true)
  }
  function openEdit(acc) {
    setEditing(acc.id)
    setForm({ name: acc.name, startingBalance: acc.startingBalance, drawdownLimit: acc.drawdownLimit })
    setOpen(true)
  }
  function submit(e) {
    e.preventDefault()
    const payload = {
      name: form.name.trim() || 'Account',
      startingBalance: Number(form.startingBalance) || 0,
      drawdownLimit: Number(form.drawdownLimit) || 0,
    }
    if (editing) updateAccount(editing, payload)
    else addAccount(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Track each funded account's balance and trailing drawdown."
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
          message="Add a funded account with its balance and max drawdown to start tracking your risk buffer."
          action={
            <button className="btn-primary" onClick={openNew}>
              <PlusIcon className="h-4 w-4" /> Add your first account
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((acc) => {
            const s = accountStats(acc)
            const breached = s.remaining <= 0
            return (
              <Card key={acc.id} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.tradeCount} trade{s.tradeCount === 1 ? '' : 's'} · started {money0(acc.startingBalance)}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(acc)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Edit"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
                    <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      {money0(s.currentBalance)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Net P&L</p>
                    <p className={`text-xl font-bold tabular-nums ${pnlColor(s.netPnl)}`}>{signedMoney(s.netPnl)}</p>
                  </div>
                </div>

                <div>
                  <Meter
                    value={s.usedPct}
                    max={100}
                    label="Drawdown used"
                    valueLabel={`${pct(s.usedPct)} of ${money0(acc.drawdownLimit)}`}
                    dangerHigh
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Floor (don&apos;t cross): <span className="font-medium text-slate-700 dark:text-slate-200">{money0(s.floor)}</span>
                    </span>
                    <span className={breached ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}>
                      {breached ? 'Breached!' : `${money(s.remaining)} buffer`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-400">High-water mark {money0(s.highWaterMark)}</span>
                  <ConfirmButton
                    className="btn-ghost px-3 py-1.5 text-xs"
                    confirmLabel="Tap to delete"
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

      <p className="mt-6 text-xs text-slate-400">
        Drawdown is computed from trades assigned to each account (set the account on a trade in the Trade Log). The
        floor trails your equity high-water mark, matching a typical prop-firm trailing drawdown.
      </p>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit account' : 'Add account'} maxWidth="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Account name</label>
            <input
              className="input"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Lucid 50K Eval"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Starting balance ($)</label>
              <input
                type="number"
                className="input"
                value={form.startingBalance}
                onChange={(e) => setForm((f) => ({ ...f, startingBalance: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Max drawdown ($)</label>
              <input
                type="number"
                className="input"
                value={form.drawdownLimit}
                onChange={(e) => setForm((f) => ({ ...f, drawdownLimit: e.target.value }))}
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
