import Papa from 'papaparse'
import type { AirportDataset, StaffShift } from '../types'
import { deriveStaffDepartment } from './staffDepartment'

// IMPORTANT: we do NOT use Papaparse's `dynamicTyping` option. It applies a
// generic float/int regex to every field, and that regex treats strings like
// "6E-4777" (IndiGo's flight_number format: airline code "6E" + digits) as
// scientific notation — 6 * 10^-4777 — which rounds to 0. That silently
// destroyed every IndiGo flight_number (and would do the same to any other
// value shaped like <digit><E><sign><digits>). Instead we parse everything
// as strings and coerce only the fields we know, from our own schema, are
// actually numeric or boolean.

const NUMERIC_FIELDS = new Set([
  'seat_capacity', 'passengers_booked', 'delay_minutes', 'distance_km', 'fuel_load_kg',
  'on_time_performance_score', 'turnaround_time_minutes', 'delay_risk_score',
  'loyalty_score', 'age', 'boarding_group', 'weight_kg', 'scan_count', 'mishandling_count',
  'duration_minutes', 'lane_number', 'processing_time_seconds', 'queue_length',
  'queue_capacity', 'wait_estimate_seconds', 'severity_level', 'duration_hours', 'priority',
  'shift_duration_hours', 'quantity', 'amount_inr', 'amount_alt',
])

const BOOLEAN_FIELDS = new Set([
  'is_international', 'weather_delay_flag', 'is_weekend', 'is_frequent_flyer',
  'has_connection', 'is_flagged', 'is_delayed', 'flagged', 'secondary_screening',
  'pat_down', 'is_aog', 'is_recurring', 'is_on_leave', 'is_duty_free',
])

function coerceRow<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(row)) {
    if (raw === '' || raw == null) {
      out[key] = raw
    } else if (BOOLEAN_FIELDS.has(key)) {
      out[key] = raw === 'True' || raw === 'true'
    } else if (NUMERIC_FIELDS.has(key)) {
      const n = Number(raw)
      out[key] = Number.isNaN(n) ? raw : n
    } else {
      out[key] = raw // IDs, codes, dates, names — always kept as plain strings
    }
  }
  return out as T
}

async function loadCsv<T>(path: string): Promise<T[]> {
  const res = await fetch(path)
  const text = await res.text()
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  })
  return parsed.data.map(coerceRow) as T[]
}

export async function loadAirportDataset(): Promise<AirportDataset> {
  const [flights, passengers, baggage, gateEvents, security, maintenance, staff, retail] =
    await Promise.all([
      loadCsv('/data/flights.csv'),
      loadCsv('/data/passengers.csv'),
      loadCsv('/data/baggage.csv'),
      loadCsv('/data/gate_events.csv'),
      loadCsv('/data/security_screening.csv'),
      loadCsv('/data/maintenance_logs.csv'),
      loadCsv('/data/staff_shifts.csv'),
      loadCsv('/data/retail_transactions.csv'),
    ])

  const staffWithDept: StaffShift[] = (staff as StaffShift[]).map((s) => ({
    ...s,
    derived_department: deriveStaffDepartment(s.staff_id),
  }))

  return {
    flights,
    passengers,
    baggage,
    gateEvents,
    security,
    maintenance,
    staff: staffWithDept,
    retail,
  } as AirportDataset
}
