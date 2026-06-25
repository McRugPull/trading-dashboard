import { NavLink, Outlet } from 'react-router-dom'
import Sidebar, { NAV } from './Sidebar'
import ThemeToggle from './ThemeToggle'
import { LockIcon } from './Icons'

function mobileLinkClass({ isActive }) {
  return [
    'flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition',
    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400',
  ].join(' ')
}

export default function Layout() {
  function lock() {
    window.dispatchEvent(new Event('ptd:lock'))
  }
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-black">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-black/90 md:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
              P
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Trading Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={lock}
              aria-label="Lock"
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-neutral-700 dark:text-slate-300 dark:hover:bg-neutral-800"
            >
              <LockIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-2 px-6 pt-5 md:flex">
          <ThemeToggle />
        </div>

        {/* Mobile nav strip */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
