import { create } from 'zustand'
import { loadAirportDataset } from '../lib/loadData'
import type { AirportDataset, OpsAlert, SimEvent } from '../types'

const SIM_SPEED_MINUTES_PER_TICK = 8 // simulated minutes advanced per tick
const TICK_MS = 1500 // real ms between ticks

interface AirportStore {
  data: AirportDataset | null
  loading: boolean
  error: string | null

  // simulation clock — sweeps through the dataset's date range to fake "live" ops
  simNow: number // epoch ms
  minTime: number
  maxTime: number
  running: boolean

  alerts: OpsAlert[]
  feed: SimEvent[]

  init: () => Promise<void>
  tick: () => void
  toggleRunning: () => void
  setSimNow: (t: number) => void
}

function safeTime(v: unknown): number {
  const t = new Date(String(v)).getTime()
  return Number.isFinite(t) ? t : NaN
}

export const useAirportStore = create<AirportStore>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  simNow: 0,
  minTime: 0,
  maxTime: 0,
  running: true,
  alerts: [],
  feed: [],

  init: async () => {
    try {
      const data = await loadAirportDataset()

      // establish the sim window from actual_departure across flights
      const times = data.flights
        .map((f) => safeTime(f.scheduled_departure))
        .filter((t) => !Number.isNaN(t))
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      set({
        data,
        loading: false,
        minTime,
        maxTime,
        simNow: minTime,
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load dataset', loading: false })
    }
  },

  tick: () => {
    const { simNow, minTime, maxTime, data } = get()
    if (!data) return
    let next = simNow + SIM_SPEED_MINUTES_PER_TICK * 60 * 1000
    if (next > maxTime) next = minTime // loop the simulation

    set({ simNow: next })
    get().setSimNow(next)
  },

  toggleRunning: () => set((s) => ({ running: !s.running })),

  setSimNow: (t: number) => {
    const { data } = get()
    if (!data) return

    const alerts: OpsAlert[] = []

    for (const f of data.flights) {
      const dep = safeTime(f.scheduled_departure)
      if (Number.isNaN(dep) || Math.abs(dep - t) > 1000 * 60 * 60 * 6) continue
      if (f.delay_minutes >= 60) {
        alerts.push({
          id: `flight-${f.flight_number}-delay`,
          severity: f.delay_minutes >= 120 ? 'critical' : 'warning',
          category: 'flight',
          message: `${f.flight_number} to ${f.destination_airport} delayed ${f.delay_minutes}m (${f.delay_reason})`,
          relatedId: f.flight_number,
          timestamp: dep,
        })
      }
    }

    for (const m of data.maintenance) {
      const rep = safeTime(m.reported_time)
      if (Number.isNaN(rep) || Math.abs(rep - t) > 1000 * 60 * 60 * 6) continue
      if (m.is_aog || m.severity_level >= 4) {
        alerts.push({
          id: `mtc-${m.work_order_id}`,
          severity: m.is_aog ? 'critical' : 'warning',
          category: 'maintenance',
          message: `${m.aircraft_registration}: ${m.defect_type} (${m.maintenance_type}) — severity ${m.severity_level}`,
          relatedId: m.aircraft_registration,
          timestamp: rep,
        })
      }
    }

    for (const s of data.security) {
      const at = safeTime(s.arrival_time)
      if (Number.isNaN(at) || Math.abs(at - t) > 1000 * 60 * 60 * 2) continue
      if (s.queue_length >= s.queue_capacity * 0.85) {
        alerts.push({
          id: `sec-${s.screening_id}`,
          severity: 'warning',
          category: 'security',
          message: `Lane ${s.lane_number} queue near capacity (${s.queue_length}/${s.queue_capacity})`,
          timestamp: at,
        })
      }
    }

    for (const b of data.baggage) {
      const ct = safeTime(b.checkin_time)
      if (Number.isNaN(ct) || Math.abs(ct - t) > 1000 * 60 * 60 * 4) continue
      if (b.is_flagged || b.mishandling_count > 0) {
        alerts.push({
          id: `bag-${b.bag_tag_number}`,
          severity: b.mishandling_count > 1 ? 'critical' : 'warning',
          category: 'baggage',
          message: `Bag ${b.bag_tag_number} on ${b.flight_number} flagged (mishandling x${b.mishandling_count})`,
          timestamp: ct,
        })
      }
    }

    alerts.sort((a, b) => b.timestamp - a.timestamp)

    // build a rolling event feed of things happening "now" (within a small window before t)
    const feed: SimEvent[] = []
    const windowMs = 1000 * 60 * 30

    for (const g of data.gateEvents) {
      const et = safeTime(g.event_time)
      if (Number.isNaN(et) || et > t || t - et > windowMs) continue
      feed.push({
        id: g.event_id,
        timestamp: et,
        category: 'gate',
        message: `${g.event_type} — ${g.flight_number} at ${g.gate}`,
      })
    }
    for (const r of data.retail) {
      const tt = safeTime(r.transaction_time)
      if (Number.isNaN(tt) || tt > t || t - tt > windowMs) continue
      feed.push({
        id: r.transaction_id,
        timestamp: tt,
        category: 'retail',
        message: `${r.product_category} purchase — ₹${r.amount_inr} near ${r.flight_number ?? 'gate'}`,
      })
    }

    feed.sort((a, b) => b.timestamp - a.timestamp)

    set({ alerts: alerts.slice(0, 30), feed: feed.slice(0, 25) })
  },
}))

export const SIM_TICK_MS = TICK_MS
