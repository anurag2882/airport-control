// ── Domain types, derived from the provided DEL airport ops dataset ──
// Column names were reverse-engineered from the raw (headerless) CSVs.
// Some fields are best-effort inferences — see NOTES.md for anything uncertain.

export interface Flight {
  flight_number: string
  airline_name: string
  airline_code: string
  origin_airport: string
  destination_airport: string
  scheduled_departure: string
  actual_departure: string
  scheduled_arrival: string
  actual_arrival: string
  aircraft_type: string
  aircraft_registration: string
  seat_capacity: number
  passengers_booked: number
  flight_status: string
  delay_minutes: number
  delay_reason: string
  terminal: string
  gate: string
  is_international: boolean
  distance_km: number
  fuel_load_kg: number
  boarding_time: string
  weather_delay_flag: boolean
  delay_category: string
  on_time_performance_score: number
  turnaround_time_minutes: number
  delay_risk_score: number
  time_of_day: string
  day_of_week: string
  is_weekend: boolean
  season: string
  route_type: string
}

export interface Passenger {
  pnr_code: string
  ticket_number: string
  passport_number: string
  first_name: string
  last_name: string
  nationality: string
  date_of_birth: string
  gender: string
  seat_number: string
  fare_class: string
  flight_number: string
  checkin_time: string
  boarding_time: string
  gate: string
  boarding_group: number
  email: string
  phone: string
  is_frequent_flyer: boolean
  loyalty_score: number
  has_connection: boolean
  connecting_class: string
  age: number
  age_group: string
}

export interface Baggage {
  bag_tag_number: string
  pnr_code: string
  flight_number: string
  passport_number: string
  weight_kg: number
  dimensions: string
  checkin_type: string
  checkin_counter: string
  checkin_time: string
  loaded_time: string
  scan_count: number
  bag_status: string
  is_flagged: boolean
  mishandling_count: number
  handling_location: string
  last_scan_time: string
  is_delayed: boolean
}

export interface GateEvent {
  event_id: string
  flight_number: string
  gate: string
  terminal: string
  event_type: string
  event_time: string
  staff_id: string
  duration_minutes: number
  event_category: string
  is_delayed: boolean
  scheduled_time: string
  created_at: string
  updated_at: string
}

export interface SecurityScreening {
  screening_id: string
  passport_number: string
  pnr_code: string
  lane_number: number
  arrival_time: string
  screening_start_time: string
  screening_end_time: string
  screening_result: string
  flagged: boolean
  staff_id: string
  lane_type: string
  processing_time_seconds: number
  secondary_screening: boolean
  pat_down: boolean
  shift_id: string
  queue_length: number
  queue_capacity: number
  wait_estimate_seconds: number
  is_delayed: boolean
}

export interface MaintenanceLog {
  work_order_id: string
  aircraft_registration: string
  flight_number: string
  maintenance_type: string
  staff_id: string
  reported_time: string
  completed_time: string
  severity_level: number
  duration_hours: number
  defect_type: string
  component: string
  priority: number
  assigned_to: string
  is_aog: boolean
  is_recurring: boolean
}

export interface StaffShift {
  staff_id: string
  staff_name: string
  department: string // constant "Ops" for every row in the source data — not useful, see derived_department
  role: string // constant "Agent" for every row — not useful
  derived_department: string // parsed from staff_id prefix (SEC/CC/RET/GH/MTC/OPS) — the real signal
  shift_date: string
  shift_start: string
  shift_end: string
  terminal: string
  gate_assigned: string
  supervisor_id: string
  shift_duration_hours: number
  is_on_leave: boolean
  last_shift_date: string
  language: string
}

export interface RetailTransaction {
  transaction_id: string
  staff_id: string
  store_category: string
  transaction_type: string
  passport_number: string
  flight_number: string
  transaction_time: string
  product_category: string
  quantity: number
  amount_inr: number
  amount_alt: number
  payment_method: string
  currency: string
  terminal: string
  location_type: string
  is_duty_free: boolean
}

export interface AirportDataset {
  flights: Flight[]
  passengers: Passenger[]
  baggage: Baggage[]
  gateEvents: GateEvent[]
  security: SecurityScreening[]
  maintenance: MaintenanceLog[]
  staff: StaffShift[]
  retail: RetailTransaction[]
}

// ── Simulation / alert types (frontend-generated, not in raw data) ──

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface OpsAlert {
  id: string
  severity: AlertSeverity
  category: 'flight' | 'baggage' | 'security' | 'maintenance' | 'gate' | 'staff'
  message: string
  relatedId?: string
  timestamp: number
}

export interface SimEvent {
  id: string
  timestamp: number
  category: 'flight' | 'baggage' | 'security' | 'maintenance' | 'gate' | 'retail'
  message: string
}
