import { useMemo } from 'react'
import { useAirportStore } from '../store/useAirportStore'
import clsx from 'clsx'

export function GateStrip() {
  const { data, simNow, gateConflicts } = useAirportStore()

  const gates = useMemo(() => {
    if (!data) return []

    const conflictedGateKeys = new Set(gateConflicts.map((c) => c.relatedId))

    // one entry per gate, holding whichever flight currently occupies it (if any)
    const byGate = new Map<string, { gate: string; terminal: string; flight?: typeof data.flights[number] }>()

    for (const f of data.flights) {
      const key = `${f.terminal}-${f.gate}`
      if (!byGate.has(key)) byGate.set(key, { gate: f.gate, terminal: f.terminal })

      const boarding = new Date(f.boarding_time).getTime()
      const sched = new Date(f.scheduled_departure).getTime()
      const end = sched + (f.turnaround_time_minutes || 30) * 60 * 1000
      if (!Number.isNaN(boarding) && simNow >= boarding && simNow <= end) {
        byGate.set(key, { gate: f.gate, terminal: f.terminal, flight: f })
      }
    }

    return Array.from(byGate.entries())
      .map(([key, v]) => ({ key, conflicted: conflictedGateKeys.has(key), ...v }))
      .sort((a, b) => a.gate.localeCompare(b.gate, undefined, { numeric: true }))
      .slice(0, 48)
  }, [data, simNow, gateConflicts])

  if (!data) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-sm text-slate-300 mb-3">Gate occupancy — live</div>
      <div className="flex flex-wrap gap-1.5">
        {gates.map((g) => {
          const occupied = !!g.flight
          const delayed = occupied && (g.flight?.delay_minutes ?? 0) > 15
          return (
            <div
              key={g.key}
              title={
                occupied
                  ? `${g.gate}: ${g.flight?.flight_number} — ${g.flight?.destination_airport}${
                      delayed ? ` (delayed ${g.flight?.delay_minutes}m)` : ''
                    }`
                  : `${g.gate}: free`
              }
              className={clsx(
                'w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-mono border cursor-default transition-colors',
                g.conflicted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 animate-pulse'
                  : delayed
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : occupied
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-600'
              )}
            >
              {g.gate}
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 inline-block" /> Occupied</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 inline-block" /> Delayed</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 inline-block" /> Conflict</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-white/10 inline-block" /> Free</span>
      </div>
    </div>
  )
}
