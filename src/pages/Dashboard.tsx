import { useMemo } from 'react'
import { useAirportStore } from '../store/useAirportStore'
import { StatCard } from '../components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { AlertTriangle, Info, Siren } from 'lucide-react'
import clsx from 'clsx'

const COLORS = ['#22d3ee', '#f472b6', '#fbbf24', '#a78bfa', '#34d399']

export default function Dashboard() {
  const { data, alerts, feed, simNow } = useAirportStore()

  const stats = useMemo(() => {
    if (!data) return null
    const window = 1000 * 60 * 60 * 6
    const nearbyFlights = data.flights.filter(
      (f) => Math.abs(new Date(f.scheduled_departure).getTime() - simNow) < window
    )
    const delayed = nearbyFlights.filter((f) => f.delay_minutes > 15)
    const avgQueue =
      data.security.reduce((acc, s) => acc + s.queue_length, 0) / (data.security.length || 1)
    const flaggedBags = data.baggage.filter((b) => b.is_flagged).length
    const aog = data.maintenance.filter((m) => m.is_aog).length
    const onLeave = data.staff.filter((s) => s.is_on_leave).length
    const revenue = data.retail.reduce((acc, r) => acc + (r.amount_inr ?? 0), 0)

    const delayReasons: Record<string, number> = {}
    for (const f of data.flights) {
      if (f.delay_minutes > 0) {
        delayReasons[f.delay_reason] = (delayReasons[f.delay_reason] || 0) + 1
      }
    }

    const byHour: Record<string, number> = {}
    for (const f of data.flights) {
      const h = new Date(f.scheduled_departure).getHours()
      const label = `${h.toString().padStart(2, '0')}:00`
      byHour[label] = (byHour[label] || 0) + 1
    }
    const hourly = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour))

    return {
      totalFlights: data.flights.length,
      nearbyFlights: nearbyFlights.length,
      delayed: delayed.length,
      avgQueue: Math.round(avgQueue),
      flaggedBags,
      aog,
      onLeave,
      revenue,
      delayReasons: Object.entries(delayReasons).map(([name, value]) => ({ name, value })),
      hourly,
    }
  }, [data, simNow])

  if (!data || !stats) return <div className="text-slate-500">Loading operational data…</div>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Flights (6h window)" value={stats.nearbyFlights} sub={`${stats.totalFlights} total in dataset`} />
        <StatCard
          label="Delayed >15m"
          value={stats.delayed}
          tone={stats.delayed > 5 ? 'critical' : 'warning'}
        />
        <StatCard label="Avg security queue" value={stats.avgQueue} sub="passengers per lane" />
        <StatCard label="Flagged bags" value={stats.flaggedBags} tone="warning" />
        <StatCard label="Aircraft AOG" value={stats.aog} tone={stats.aog > 0 ? 'critical' : 'good'} />
        <StatCard label="Staff on leave" value={stats.onLeave} />
        <StatCard label="Duty-free revenue" value={`₹${(stats.revenue / 1000).toFixed(0)}k`} tone="good" />
        <StatCard label="Active alerts" value={alerts.length} tone={alerts.length > 5 ? 'critical' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm text-slate-300 mb-3">Scheduled departures by hour</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0d121e', border: '1px solid #ffffff20' }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm text-slate-300 mb-3">Delay reasons</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.delayReasons} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {stats.delayReasons.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d121e', border: '1px solid #ffffff20' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm text-slate-300 mb-3 flex items-center gap-2">
            <Siren size={14} className="text-rose-400" /> Live alerts
          </div>
          <div className="space-y-1.5 max-h-72 overflow-auto">
            {alerts.length === 0 && <div className="text-xs text-slate-500">No active alerts right now.</div>}
            {alerts.map((a) => (
              <div
                key={a.id}
                className={clsx(
                  'flex items-start gap-2 text-xs px-3 py-2 rounded-lg border',
                  a.severity === 'critical' && 'border-rose-500/30 bg-rose-500/5 text-rose-300',
                  a.severity === 'warning' && 'border-amber-500/30 bg-amber-500/5 text-amber-300',
                  a.severity === 'info' && 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300'
                )}
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm text-slate-300 mb-3 flex items-center gap-2">
            <Info size={14} className="text-cyan-400" /> Live operations feed
          </div>
          <div className="space-y-1.5 max-h-72 overflow-auto">
            {feed.length === 0 && <div className="text-xs text-slate-500">No recent events.</div>}
            {feed.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-white/5 text-slate-300">
                <span className="text-slate-500 font-mono shrink-0">
                  {new Date(e.timestamp).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                </span>
                <span>{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
