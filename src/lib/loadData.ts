import Papa from 'papaparse'
import type { AirportDataset } from '../types'

// Coerce common string representations into JS types.
// Papaparse's dynamicTyping handles numbers, but booleans/CSV "True"/"False"
// come through as strings unless we normalize them ourselves.
function coerceRow<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    if (value === 'True') out[key] = true
    else if (value === 'False') out[key] = false
    else out[key] = value
  }
  return out as T
}

async function loadCsv<T>(path: string): Promise<T[]> {
  const res = await fetch(path)
  const text = await res.text()
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })
  console.log(parsed.data.slice(10, 20));
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

  return {
    flights,
    passengers,
    baggage,
    gateEvents,
    security,
    maintenance,
    staff,
    retail,
  } as AirportDataset
}
