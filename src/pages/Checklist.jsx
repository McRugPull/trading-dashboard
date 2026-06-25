import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { CHECKLIST_ITEMS } from '../lib/constants'
import { Card, PageHeader, Meter } from '../components/ui'
import { CheckSquareIcon, TargetIcon, AlertIcon } from '../components/Icons'

export default function Checklist() {
  const { pendingChecklist, setChecklistItem, resetChecklist, checklistComplete } = useData()
  const done = CHECKLIST_ITEMS.filter((i) => pendingChecklist[i.id]).length

  return (
    <div>
      <PageHeader
        title="Pre-Trade Checklist"
        subtitle="Every box must be checked before you log a trade. Discipline first, P&L follows."
        actions={
          <button className="btn-ghost" onClick={resetChecklist}>
            Reset
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {CHECKLIST_ITEMS.map((item) => {
            const checked = !!pendingChecklist[item.id]
            return (
              <button
                key={item.id}
                onClick={() => setChecklistItem(item.id, !checked)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                  checked
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/20'
                    : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition ${
                    checked
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-white">{item.label}</span>
                  <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{item.hint}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <TargetIcon className="h-5 w-5 text-brand-500" />
              <span className="font-semibold">Readiness</span>
            </div>
            <Meter
              value={done}
              max={CHECKLIST_ITEMS.length}
              label="Checklist progress"
              valueLabel={`${done}/${CHECKLIST_ITEMS.length}`}
              dangerHigh={false}
            />
            <div className="mt-5">
              {checklistComplete ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-700/60 dark:bg-emerald-900/20">
                  <CheckSquareIcon className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-300">Cleared to trade</p>
                  <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Your checklist is logged with the trade.
                  </p>
                  <Link to="/trades" className="btn-primary mt-3 w-full">
                    Log the trade →
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-700/60 dark:bg-amber-900/20">
                  <AlertIcon className="mx-auto h-8 w-8 text-amber-500" />
                  <p className="mt-2 font-semibold text-amber-700 dark:text-amber-300">Not ready yet</p>
                  <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                    Finish all {CHECKLIST_ITEMS.length} checks before entering.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="text-sm text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Why this matters</p>
            <p className="mt-2 leading-relaxed">
              The Trade Log won&apos;t let you record a trade until this checklist is complete. When you do log one, the
              checklist state is snapshotted onto the trade so you can review your process later.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
