import { useState } from 'react'
import { useData } from '../context/DataContext'
import { playbookStats } from '../lib/analytics'
import { Card, PageHeader, Modal, EmptyState, ConfirmButton } from '../components/ui'
import { PlusIcon, TargetIcon, EditIcon, TrashIcon, XIcon } from '../components/Icons'
import { signedMoney, pnlColor, pct, num } from '../lib/format'

const blank = { name: '', description: '', rules: [] }

export default function Playbook() {
  const { playbooks, trades, addPlaybook, updatePlaybook, deletePlaybook } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [ruleDraft, setRuleDraft] = useState('')

  function openNew() {
    setEditing(null)
    setForm(blank)
    setRuleDraft('')
    setOpen(true)
  }
  function openEdit(pb) {
    setEditing(pb.id)
    setForm({ name: pb.name, description: pb.description || '', rules: pb.rules || [] })
    setRuleDraft('')
    setOpen(true)
  }
  function addRule() {
    const r = ruleDraft.trim()
    if (!r) return
    setForm((f) => ({ ...f, rules: [...f.rules, r] }))
    setRuleDraft('')
  }
  function removeRule(i) {
    setForm((f) => ({ ...f, rules: f.rules.filter((_, idx) => idx !== i) }))
  }
  function submit(e) {
    e.preventDefault()
    const payload = { name: form.name.trim() || 'Playbook', description: form.description, rules: form.rules }
    if (editing) updatePlaybook(editing, payload)
    else addPlaybook(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Playbook"
        subtitle="Define your setups, write the rules, and let the data tell you which ones actually pay."
        actions={
          <button className="btn-primary" onClick={openNew}>
            <PlusIcon className="h-4 w-4" /> New playbook
          </button>
        }
      />

      {playbooks.length === 0 ? (
        <EmptyState
          icon={TargetIcon}
          title="No playbooks yet"
          message="Create one per setup you trade (e.g. “SND + Fib golden zone”). Assign it when logging trades and you'll see exactly which setups make you money."
          action={
            <button className="btn-primary" onClick={openNew}>
              <PlusIcon className="h-4 w-4" /> Create your first playbook
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {playbooks.map((pb) => {
            const s = playbookStats(pb, trades)
            return (
              <Card key={pb.id} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{pb.name}</h3>
                    {pb.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{pb.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(pb)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-neutral-700 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
                    >
                      <EditIcon className="h-3.5 w-3.5" /> Edit
                    </button>
                    <ConfirmButton
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-1 text-rose-500 hover:border-rose-400 hover:bg-rose-50 dark:border-neutral-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      confirmLabel={<span className="text-xs font-semibold">Sure?</span>}
                      onConfirm={() => deletePlaybook(pb.id)}
                      title="Delete playbook"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PbStat label="Net P&L" value={signedMoney(s.totalPnl)} className={pnlColor(s.totalPnl)} />
                  <PbStat label="Trades" value={s.totalTrades} />
                  <PbStat label="Win rate" value={s.totalTrades ? pct(s.winRate) : '—'} />
                  <PbStat
                    label="Expectancy"
                    value={s.totalTrades ? signedMoney(s.expectancy) : '—'}
                    className={s.totalTrades ? pnlColor(s.expectancy) : ''}
                  />
                </div>
                {s.avgR != null && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Avg R-multiple: <span className={`font-semibold ${s.avgR >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{num(s.avgR)}R</span>
                  </p>
                )}

                {/* Rules */}
                {(pb.rules || []).length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-neutral-800/50">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Rules</p>
                    <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200">
                      {pb.rules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Assign a playbook when logging a trade (Trade Log → Playbook dropdown). Stats update automatically as you trade.
      </p>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit playbook' : 'New playbook'} maxWidth="max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. SND + Fib golden zone"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[60px] resize-y text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="When does this setup appear? What market conditions?"
            />
          </div>
          <div>
            <label className="label">Entry rules</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={ruleDraft}
                onChange={(e) => setRuleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addRule()
                  }
                }}
                placeholder="Type a rule, press Enter"
              />
              <button type="button" className="btn-ghost" onClick={addRule}>
                Add
              </button>
            </div>
            {form.rules.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {form.rules.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                    <span>
                      {i + 1}. {r}
                    </span>
                    <button type="button" onClick={() => removeRule(i)} className="text-slate-400 hover:text-rose-500" aria-label="Remove rule">
                      <XIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Create playbook'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function PbStat({ label, value, className = '' }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-neutral-800/50">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-base font-bold tabular-nums ${className || 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  )
}
