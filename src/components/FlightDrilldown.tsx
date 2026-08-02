import { useMemo } from 'react'
import { useAirportStore } from '../store/useAirportStore'
import { DetailRow } from './Modal'
import type { Flight } from '../types'
import clsx from 'clsx'
import { Users, Luggage, DoorOpen, Wrench, AlertTriangle } from 'lucide-react'

function fmt(t: string) {
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
}

export function FlightDrilldown({ flight }: { flight: Flight }) {
  const { data } = useAirportStore()

  const linked = useMemo(() => {
    if (!data) return null

    const passengers = data.passengers.filter((p) => p.flight_number === flight.flight_number)
    const bags = data.baggage.filter((b) => b.flight_number === flight.flight_number)
    const gateEvents = data.gateEvents
      .filter((g) => g.flight_number === flight.flight_number)
      .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())
    const maintenance = data.maintenance.filter(
      (m) => m.aircraft_registration === flight.aircraft_registration
    )

    const flaggedBags = bags.filter((b) => b.is_flagged || b.mishandling_count > 0)
    const checkedIn = passengers.filter((p) => p.checkin_time).length
    const businessCount = passengers.filter((p) => p.fare_class === 'Business').length
    const openWorkOrders = maintenance.filter((m) => !m.completed_time)
    const aogRisk = maintenance.some((m) => m.is_aog)

    return { passengers, bags, gateEvents, maintenance, flaggedBags, checkedIn, businessCount, openWorkOrders, aogRisk }
  }, [data, flight])

  if (!linked) return null

  const { passengers, bags, gateEvents, maintenance, flaggedBags, checkedIn, businessCount, openWorkOrders, aogRisk } = linked

  return (
    <div className="space-y-5">
      {/* Composite status strip */}
      <div
        className={clsx(
          'rounded-lg border px-4 py-3 text-sm flex items-start gap-2',
          aogRisk || flaggedBags.length > 0
            ? 'border-rose-500/30 bg-rose-500/5 text-rose-200'
            : flight.delay_minutes > 15
            ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
            : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
        )}
      >
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>
          {flight.passengers_booked}/{flight.seat_capacity} seats booked · {bags.length} bags (
          {flaggedBags.length} flagged) · {aogRisk ? 'aircraft AOG risk' : `${openWorkOrders.length} open work order(s)`}
          {flight.delay_minutes > 15 && ` · running ${flight.delay_minutes}m late (${flight.delay_reason})`}
        </span>
      </div>

      {/* Flight core detail */}
      <section>
        <DetailRow label="Route" value={`${flight.origin_airport} → ${flight.destination_airport}`} />
        <DetailRow label="Aircraft" value={`${flight.aircraft_type} (${flight.aircraft_registration})`} />
        <DetailRow label="Terminal / Gate" value={`${flight.terminal} / ${flight.gate}`} />
        <DetailRow label="Scheduled Departure" value={fmt(flight.scheduled_departure)} />
        <DetailRow label="Actual Departure" value={fmt(flight.actual_departure)} />
        <DetailRow label="Delay Risk Score" value={flight.delay_risk_score?.toFixed(2)} />
      </section>

      {/* Passengers */}
      <section>
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
          <Users size={14} className="text-cyan-400" />
          Passengers ({passengers.length})
        </div>
        <div className="text-xs text-slate-500 mb-2">
          {checkedIn} checked in · {businessCount} Business · {passengers.length - businessCount} Economy
        </div>
        <div className="max-h-32 overflow-auto rounded-lg border border-white/10">
          {passengers.slice(0, 8).map((p) => (
            <div
              key={p.pnr_code}
              className="flex justify-between text-xs px-3 py-1.5 border-b border-white/5 last:border-0 text-slate-300"
            >
              <span>
                {p.first_name} {p.last_name} · {p.pnr_code}
              </span>
              <span className="text-slate-500">
                {p.seat_number} · {p.fare_class}
              </span>
            </div>
          ))}
          {passengers.length > 8 && (
            <div className="text-xs text-slate-500 px-3 py-1.5">
              +{passengers.length - 8} more passengers
            </div>
          )}
          {passengers.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-2">No passenger records linked to this flight.</div>
          )}
        </div>
      </section>

      {/* Baggage */}
      <section>
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
          <Luggage size={14} className="text-cyan-400" />
          Baggage ({bags.length})
        </div>
        <div className="max-h-32 overflow-auto rounded-lg border border-white/10">
          {bags.slice(0, 8).map((b) => (
            <div
              key={b.bag_tag_number}
              className="flex justify-between text-xs px-3 py-1.5 border-b border-white/5 last:border-0"
            >
              <span className="text-slate-300">{b.bag_tag_number} · {b.weight_kg?.toFixed(1)}kg</span>
              <span className={clsx(b.is_flagged || b.mishandling_count > 0 ? 'text-rose-300' : 'text-slate-500')}>
                {b.bag_status}
                {(b.is_flagged || b.mishandling_count > 0) && ' · flagged'}
              </span>
            </div>
          ))}
          {bags.length > 8 && (
            <div className="text-xs text-slate-500 px-3 py-1.5">+{bags.length - 8} more bags</div>
          )}
          {bags.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-2">No baggage records linked to this flight.</div>
          )}
        </div>
      </section>

      {/* Gate timeline */}
      <section>
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
          <DoorOpen size={14} className="text-cyan-400" />
          Gate Timeline ({gateEvents.length})
        </div>
        <div className="max-h-32 overflow-auto rounded-lg border border-white/10">
          {gateEvents.map((g) => (
            <div
              key={g.event_id}
              className="flex justify-between text-xs px-3 py-1.5 border-b border-white/5 last:border-0 text-slate-300"
            >
              <span>{g.event_type}</span>
              <span className="text-slate-500">{fmt(g.event_time)}</span>
            </div>
          ))}
          {gateEvents.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-2">No gate events logged for this flight.</div>
          )}
        </div>
      </section>

      {/* Aircraft maintenance */}
      <section>
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
          <Wrench size={14} className={aogRisk ? 'text-rose-400' : 'text-cyan-400'} />
          Aircraft Maintenance — {flight.aircraft_registration} ({maintenance.length})
        </div>
        <div className="max-h-32 overflow-auto rounded-lg border border-white/10">
          {maintenance.map((m) => (
            <div
              key={m.work_order_id}
              className="flex justify-between text-xs px-3 py-1.5 border-b border-white/5 last:border-0"
            >
              <span className="text-slate-300">
                {m.defect_type} · {m.component}
              </span>
              <span className={clsx(m.is_aog ? 'text-rose-300' : 'text-slate-500')}>
                severity {m.severity_level}
                {m.is_aog && ' · AOG'}
                {!m.completed_time && ' · open'}
              </span>
            </div>
          ))}
          {maintenance.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-2">No maintenance history for this aircraft.</div>
          )}
        </div>
      </section>
    </div>
  )
}
