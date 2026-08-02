import type { Flight, OpsAlert } from '../types'

export type FlightPhase = 'Scheduled' | 'Boarding' | 'Departed' | 'Delayed'

function t(v: string): number {
  const n = new Date(v).getTime()
  return Number.isNaN(n) ? NaN : n
}

/** Live phase of a flight relative to the simulated clock — this is what makes
 * the "real-time" requirement visible on screen instead of only affecting alerts. */
export function getFlightPhase(f: Flight, simNow: number): FlightPhase {
  const boarding = t(f.boarding_time)
  const sched = t(f.scheduled_departure)
  const actual = t(f.actual_departure)

  if (!Number.isNaN(actual) && simNow >= actual) return 'Departed'
  if (f.delay_minutes > 15 && !Number.isNaN(sched) && simNow >= sched) return 'Delayed'
  if (!Number.isNaN(boarding) && simNow >= boarding) return 'Boarding'
  return 'Scheduled'
}

/** A flight "occupies" its gate from boarding until scheduled departure + turnaround.
 * Two flights sharing a gate with overlapping occupied windows is a real
 * operational conflict signal a control-center tool should surface. */
export function computeGateConflicts(flights: Flight[]): OpsAlert[] {
  const byGate = new Map<string, Flight[]>()
  for (const f of flights) {
    const key = `${f.terminal}-${f.gate}`
    if (!byGate.has(key)) byGate.set(key, [])
    byGate.get(key)!.push(f)
  }

  const alerts: OpsAlert[] = []

  for (const [gateKey, group] of byGate) {
    const withWindows = group
      .map((f) => {
        const start = t(f.boarding_time) || t(f.scheduled_departure)
        const sched = t(f.scheduled_departure)
        const end = Number.isNaN(sched) ? NaN : sched + (f.turnaround_time_minutes || 30) * 60 * 1000
        return { f, start, end }
      })
      .filter((w) => !Number.isNaN(w.start) && !Number.isNaN(w.end))
      .sort((a, b) => a.start - b.start)

    for (let i = 0; i < withWindows.length - 1; i++) {
      const a = withWindows[i]
      const b = withWindows[i + 1]
      if (b.start < a.end) {
        alerts.push({
          id: `gateconflict-${gateKey}-${a.f.flight_number}-${b.f.flight_number}`,
          severity: 'critical',
          category: 'gate',
          message: `Gate ${gateKey.replace('-', '/')}: ${a.f.flight_number} and ${b.f.flight_number} overlap (${Math.round((a.end - b.start) / 60000)}m clash)`,
          relatedId: gateKey,
          timestamp: b.start,
        })
      }
    }
  }

  return alerts
}
