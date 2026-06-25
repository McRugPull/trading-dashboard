import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { load, save, uid } from '../lib/storage'
import { calcPnl } from '../lib/pnl'
import { CHECKLIST_ITEMS, DEFAULT_INSTRUMENTS } from '../lib/constants'
import {
  accountStats,
  rulesStreak,
  sumPnl,
  todayTrades,
  tradeBrokeRules,
} from '../lib/analytics'

const DataContext = createContext(null)

const emptyChecklist = () => Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.id, false]))

// Attach a P&L to a trade record. An explicit `pnlOverride` (e.g. realized P&L
// from an imported broker CSV) wins; otherwise we compute from tick math.
function withPnl(t) {
  const override = Number(t.pnlOverride)
  if (Number.isFinite(override)) return { ...t, pnl: override }
  return { ...t, pnl: calcPnl(t) }
}

export function DataProvider({ children }) {
  const [trades, setTrades] = useState(() => load('trades', []))
  const [accounts, setAccounts] = useState(() => load('accounts', []))
  const [journal, setJournal] = useState(() => load('journal', { daily: {}, weekly: {}, monthly: {} }))
  const [instruments, setInstruments] = useState(() => load('instruments', DEFAULT_INSTRUMENTS))
  const [settings, setSettings] = useState(() => load('settings', { name: 'Preston', apiKey: '' }))
  const [pendingChecklist, setPendingChecklist] = useState(() => load('pendingChecklist', emptyChecklist()))

  // Persist each slice independently. NOTE: the effect body is wrapped in braces
  // so it returns `undefined` — `save()` returns a boolean, and returning a
  // non-function from useEffect makes React try to call it as a cleanup
  // function on the next run/unmount (e.g. `true()` → TypeError → blank screen).
  useEffect(() => {
    save('trades', trades)
  }, [trades])
  useEffect(() => {
    save('accounts', accounts)
  }, [accounts])
  useEffect(() => {
    save('journal', journal)
  }, [journal])
  useEffect(() => {
    save('instruments', instruments)
  }, [instruments])
  useEffect(() => {
    save('settings', settings)
  }, [settings])
  useEffect(() => {
    save('pendingChecklist', pendingChecklist)
  }, [pendingChecklist])

  // ---- Trade ops ----
  function addTrade(data) {
    const trade = withPnl({
      id: uid(),
      createdAt: new Date().toISOString(),
      tags: [],
      quality: 0,
      rulesFollowed: true,
      accountId: null,
      journalId: null,
      screenshot: null,
      notes: '',
      fees: 0,
      ...data,
    })
    setTrades((prev) => [trade, ...prev])
    return trade
  }

  function updateTrade(id, patch) {
    setTrades((prev) => prev.map((t) => (t.id === id ? withPnl({ ...t, ...patch }) : t)))
  }

  function deleteTrade(id) {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }

  // Bulk import (CSV). Each row should already be a normalized trade-ish object.
  function importTrades(rows) {
    const mapped = rows.map((r) =>
      withPnl({
        id: uid(),
        createdAt: new Date().toISOString(),
        tags: [],
        quality: 0,
        rulesFollowed: true,
        accountId: null,
        journalId: null,
        screenshot: null,
        notes: '',
        fees: 0,
        ...r,
      })
    )
    setTrades((prev) => [...mapped, ...prev])
    return mapped.length
  }

  // ---- Account ops ----
  function addAccount(data) {
    const acc = {
      id: uid(),
      name: 'New Account',
      startingBalance: 50000,
      drawdownLimit: 2000,
      createdAt: new Date().toISOString(),
      ...data,
    }
    setAccounts((prev) => [...prev, acc])
    return acc
  }
  function updateAccount(id, patch) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }
  function deleteAccount(id) {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    // Unassign any trades pointing at it.
    setTrades((prev) => prev.map((t) => (t.accountId === id ? { ...t, accountId: null } : t)))
  }

  // ---- Journal ops (keyed by day/week/month string) ----
  function getJournal(kind, key) {
    return journal[kind]?.[key] || null
  }
  function saveJournal(kind, key, entry) {
    setJournal((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], [key]: { ...prev[kind]?.[key], ...entry, updatedAt: new Date().toISOString() } },
    }))
  }

  // ---- Instruments ----
  function addInstrument(data) {
    const symbol = (data.symbol || '').trim().toUpperCase()
    if (!symbol) return
    setInstruments((prev) => {
      const without = prev.filter((i) => i.symbol !== symbol)
      return [...without, { name: '', tickValue: 0, tickSize: 0, ...data, symbol }].sort((a, b) =>
        a.symbol.localeCompare(b.symbol)
      )
    })
  }
  function removeInstrument(symbol) {
    setInstruments((prev) => prev.filter((i) => i.symbol !== symbol))
  }

  // ---- Settings ----
  function updateSettings(patch) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  // ---- Checklist ----
  function setChecklistItem(id, value) {
    setPendingChecklist((prev) => ({ ...prev, [id]: value }))
  }
  function resetChecklist() {
    setPendingChecklist(emptyChecklist())
  }
  const checklistComplete = useMemo(
    () => CHECKLIST_ITEMS.every((i) => pendingChecklist[i.id]),
    [pendingChecklist]
  )

  // ---- Danger zone ----
  function clearAllData() {
    setTrades([])
    setAccounts([])
    setJournal({ daily: {}, weekly: {}, monthly: {} })
    setInstruments(DEFAULT_INSTRUMENTS)
    resetChecklist()
  }

  // ---- Derived dashboards values ----
  const derived = useMemo(() => {
    const todays = todayTrades(trades)
    return {
      todays,
      todayPnl: sumPnl(todays),
      streak: rulesStreak(trades),
      anyRulesBrokenToday: todays.some(tradeBrokeRules),
    }
  }, [trades])

  const value = {
    // state
    trades,
    accounts,
    journal,
    instruments,
    settings,
    pendingChecklist,
    // trade ops
    addTrade,
    updateTrade,
    deleteTrade,
    importTrades,
    // account ops
    addAccount,
    updateAccount,
    deleteAccount,
    accountStats: (acc) => accountStats(acc, trades),
    // journal
    getJournal,
    saveJournal,
    // instruments
    addInstrument,
    removeInstrument,
    // settings
    updateSettings,
    // checklist
    setChecklistItem,
    resetChecklist,
    checklistComplete,
    // danger
    clearAllData,
    // derived
    ...derived,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
