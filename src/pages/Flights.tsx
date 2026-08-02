import { useState } from 'react'
import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import { Modal } from '../components/Modal'
import { FlightDrilldown } from '../components/FlightDrilldown'
import { getFlightPhase } from '../lib/flightPhase'
import type { Flight } from '../types'
import clsx from 'clsx'

const PHASE_STYLES: Record<string, string> = {
  Scheduled: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  Boarding: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  Departed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Delayed: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
}

function StatusBadge({ f, simNow }: { f: Flight; simNow: number }) {
  const phase = getFlightPhase(f, simNow)
  return (
    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border', PHASE_STYLES[phase])}>
      {phase === 'Delayed' ? `Delayed ${f.delay_minutes}m` : phase}
    </span>
  )
}

export default function Flights() {
  const { data, simNow } = useAirportStore()
  const [selected, setSelected] = useState<Flight | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'delayed' | 'ontime'>('all')

  if (!data) return null

  const rows = data.flights.filter((f) => {
    if (statusFilter === 'delayed') return f.delay_minutes > 15
    if (statusFilter === 'ontime') return f.delay_minutes <= 15
    return true
  })

  const columns: Column<Flight>[] = [
    { key: 'flight_number', label: 'Flight' },
    { key: 'airline_name', label: 'Airline' },
    { key: 'destination_airport', label: 'Dest' },
    { key: 'gate', label: 'Gate' },
    {
      key: 'scheduled_departure',
      label: 'Sched. Dep',
      render: (f) => new Date(f.scheduled_departure).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    },
    { key: 'aircraft_type', label: 'Aircraft' },
    { key: 'passengers_booked', label: 'Pax', numeric: true },
    { key: 'delay_minutes', label: 'Live Status', render: (f) => <StatusBadge f={f} simNow={simNow} /> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Flights</h1>
        <div className="flex gap-1.5 text-xs">
          {(['all', 'delayed', 'ontime'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'px-3 py-1.5 rounded-md border',
                statusFilter === s
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'border-white/10 text-slate-400 hover:bg-white/5'
              )}
            >
              {s === 'all' ? 'All' : s === 'delayed' ? 'Delayed' : 'On Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-160px)]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(f) => f.flight_number}
          onRowClick={setSelected}
          searchKeys={['flight_number', 'airline_name', 'destination_airport', 'gate']}
        />
      </div>

      {selected && (
        <Modal title={`Flight ${selected.flight_number} — ${selected.airline_name}`} onClose={() => setSelected(null)} size="xl">
          <FlightDrilldown flight={selected} />
        </Modal>
      )}
    </div>
  )
}
