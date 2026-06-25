import { NavLink } from 'react-router-dom'
import {
  ChartIcon,
  CheckSquareIcon,
  HomeIcon,
  BookIcon,
  ListIcon,
  LockIcon,
  WalletIcon,
} from './Icons'

export const NAV = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/trades', label: 'Trade Log', icon: ListIcon },
  { to: '/journal', label: 'Journal', icon: BookIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/accounts', label: 'Accounts', icon: WalletIcon },
  { to: '/checklist', label: 'Checklist', icon: CheckSquareIcon },
]

function linkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white',
  ].join(' ')
}

export default function Sidebar() {
  function lock() {
    window.dispatchEvent(new Event('ptd:lock'))
  }
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-900 md:flex">
      <div className="mb-6 flex items-center gap-3 px-1">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-base font-black text-white">
          P
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Preston&apos;s</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trading Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={lock}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      >
        <LockIcon className="h-5 w-5" />
        Lock
      </button>
    </aside>
  )
}
