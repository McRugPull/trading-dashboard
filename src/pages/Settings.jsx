import { useData } from '../context/DataContext'
import { Card, PageHeader, ConfirmButton } from '../components/ui'
import { clearPin } from '../lib/auth'

export default function Settings() {
  const { settings, updateSettings, clearAllData } = useData()

  function resetPin() {
    clearPin()
    // Re-lock so the gate prompts for a brand-new PIN.
    window.dispatchEvent(new Event('ptd:lock'))
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Personalise your dashboard. Everything here lives only in this browser." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Your name</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Shown in the sidebar and the “Welcome back” header. Leave blank for a neutral “My Trading Dashboard”.
          </p>
          <input
            className="input"
            value={settings.name || ''}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="e.g. your name or a handle"
          />
        </Card>

        {/* API key */}
        <Card>
          <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Anthropic API key</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Used only by Analytics → AI Insights. Stored in this browser and sent directly to Anthropic from your device.
            Use a key with a low spend cap; never on a shared computer.
          </p>
          <input
            type="password"
            className="input font-mono text-sm"
            placeholder="sk-ant-…"
            value={settings.apiKey || ''}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
          />
        </Card>
      </div>

      {/* Sharing */}
      <Card className="mt-4 border-brand-200 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-950/20">
        <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Sharing this dashboard</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Just send anyone the link — all data (PIN, trades, journals) is stored per-browser, so when they open it on
          their own device they get a blank dashboard and set their own PIN. They never see your data, and you never see
          theirs.
        </p>
      </Card>

      {/* Danger zone */}
      <Card className="mt-4 border-rose-200 dark:border-rose-900/40">
        <h2 className="mb-1 font-semibold text-rose-600 dark:text-rose-400">Danger zone</h2>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          These only affect this browser and can&apos;t be undone.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-xl border border-slate-200 p-3 dark:border-neutral-800">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Clear all trading data</p>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Wipes trades, accounts, and journals. Keeps your PIN and name.
            </p>
            <ConfirmButton className="btn-danger w-full" confirmLabel="Tap again to wipe everything" onConfirm={clearAllData}>
              Clear all data
            </ConfirmButton>
          </div>
          <div className="flex-1 rounded-xl border border-slate-200 p-3 dark:border-neutral-800">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Reset PIN</p>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Removes your PIN and asks you to set a new one. Keeps your data.
            </p>
            <ConfirmButton className="btn-ghost w-full" confirmLabel="Tap again to reset PIN" onConfirm={resetPin}>
              Reset PIN
            </ConfirmButton>
          </div>
        </div>
      </Card>
    </div>
  )
}
