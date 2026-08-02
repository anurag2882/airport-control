import { NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard, Plane, DoorOpen, Luggage, Users, ShieldCheck,
  Wrench, UserCog, ShoppingBag, Play, Pause, Radio,
} from 'lucide-react'
import { useAirportStore, SIM_TICK_MS } from '../store/useAirportStore'
import clsx from 'clsx'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/gates', label: 'Gates', icon: DoorOpen },
  { to: '/baggage', label: 'Baggage', icon: Luggage },
  { to: '/passengers', label: 'Passengers', icon: Users },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/staff', label: 'Staff', icon: UserCog },
  { to: '/retail', label: 'Retail', icon: ShoppingBag },
]

export function Layout() {
  const { simNow, running, toggleRunning, tick, loading } = useAirportStore()

  useEffect(() => {
    if (!running || loading) return
    const id = setInterval(() => tick(), SIM_TICK_MS)
    return () => clearInterval(id)
  }, [running, loading, tick])

  const simDate = new Date(simNow)

  return (
    <div className="flex h-screen bg-[#0a0e17] text-slate-200">
      <aside className="w-56 shrink-0 border-r border-white/10 flex flex-col">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-sm font-semibold tracking-wide text-white">DEL OPS CENTER</div>
          <div className="text-[11px] text-slate-500">Airport Operations Control</div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-4 py-2.5 text-sm mx-2 rounded-lg mb-0.5 transition-colors',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b border-white/10 flex items-center justify-between px-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio size={13} className={clsx(running && 'text-emerald-400 animate-pulse')} />
            <span>SIMULATED TIME</span>
            <span className="text-slate-200 font-mono text-sm">
              {simDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
            </span>
          </div>
          <button
            onClick={toggleRunning}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300"
          >
            {running ? <Pause size={13} /> : <Play size={13} />}
            {running ? 'Pause sim' : 'Resume sim'}
          </button>
        </header>
        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
